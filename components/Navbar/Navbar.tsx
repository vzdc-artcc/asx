import React from 'react';
import {AppBar, Box, Button, Toolbar, Typography} from "@mui/material";
import LoginButton from "@/components/Navbar/LoginButton";
import {Session} from "next-auth";
import Link from "next/link";
import config from '@/package.json' with {type: 'json'};
import ColorModeSwitcher from "@/components/Navbar/ColorModeSwitcher";
import Logo from "@/components/Navbar/Logo";
import AppPickerMenu from "@/components/AppPicker/AppPickerMenu";

const {IS_STAFF_ENDPOINT} = process.env;

export default async function Navbar({session}: { session: Session | null, }) {

    const res = await fetch(IS_STAFF_ENDPOINT?.replace('{cid}', session?.user.cid || 'null') || '');
    const isStaff: boolean = await res.json();

    return (
        <AppBar position="sticky">
            <Toolbar>
                <Box sx={{display: {xs: 'none', sm: 'flex',},}}>
                    <Logo/>
                </Box>
                <Link href="/" style={{textDecoration: 'none', color: 'inherit',}}>
                    <Typography variant="h6" sx={{ml: 2,}}>A.S.X. v{config.version}</Typography>
                </Link>
                <span style={{flexGrow: 1,}}></span>
                <ColorModeSwitcher/>
                <AppPickerMenu/>
                {session && isStaff && <Link href="/admin" style={{color: 'inherit',}}>
                    <Button variant="outlined" color="inherit" sx={{ml: 1,}}>ADMIN</Button>
                </Link>}
                <LoginButton session={session}/>
            </Toolbar>
        </AppBar>
    );
}