import {NextAuthOptions} from "next-auth";
import VatsimProvider from "@/auth/vatsimProvider";
import {Adapter} from "next-auth/adapters";
import prisma from "@/lib/db";
import {PrismaAdapter} from "@auth/prisma-adapter";

const VATUSA_FACILITY = process.env['VATUSA_FACILITY'];
const VATUSA_API_KEY = process.env['VATUSA_API_KEY'] || '';
const DEV_MODE = process.env['DEV_MODE'] === 'true';

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as Adapter,
    providers: [
        VatsimProvider(
            process.env['VATSIM_CLIENT_ID'],
            process.env['VATSIM_CLIENT_SECRET'],
        ),
    ],
    theme: {
        logo: '/img/logo.png',
    },
    callbacks: {
        signIn: async ({user}) => {
            if (!DEV_MODE) {
                const res = await fetch(`https://api.vatusa.net/v2/user/${user.cid}?apikey=${VATUSA_API_KEY}`);
                const userData = await res.json();
                return userData.data.facility === VATUSA_FACILITY || userData.data.visiting_facilities.map((f: {facility: string}) => f.facility).includes(VATUSA_FACILITY);
            }
            return true;
        },
        session: async ({session, user}) => {
            session.user = user;
            return session;
        }
    }
}
