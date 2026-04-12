import {Card, CardActionArea, CardContent, CardMedia, Container, Grid, Typography} from "@mui/material";
import Image from "next/image";
import airspaceExplorer from "@/public/img/airspace-explorer.png";
import activeConsolidations from "@/public/img/active-consolidations.png";
import Link from "next/link";


export default function Home() {
  return (
      (<Container maxWidth="md" sx={{mt: 10,}}>
      <Grid container spacing={4} columns={2}>
        <Grid size={{ xs: 2, md: 1, }}>
          <Link href="/active-consolidations" style={{color: 'inherit', textDecoration: 'none',}}>
            <Card sx={{height: '100%',}}>
              <CardActionArea>
                <CardMedia title="Active Radar Consolidations">
                  <div style={{position: 'relative', width: '100%', height: 200,}}>
                      <Image
                          src={activeConsolidations}
                          alt="Active Radar Consolidations"
                          fill
                          sizes="100vw"
                          style={{
                              objectFit: "cover"
                          }}/>
                  </div>
                </CardMedia>
                <CardContent>
                  <Typography variant="h5" gutterBottom>Active Radar Consolidations</Typography>
                  <Typography>See the current radar splits vZDC is using. Accuracy is not guaranteed unless explicitly
                    communicated through official mediums.</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Link>
        </Grid>
        <Grid size={{ xs: 2, md: 1, }}>
          <Link href="/explorer" style={{color: 'inherit', textDecoration: 'none',}}>
            <Card sx={{height: '100%',}}>
              <CardActionArea sx={{height: '100%',}}>
                <CardMedia title="Active Radar Consolidations">
                  <div style={{position: 'relative', width: '100%', height: 200,}}>
                      <Image
                          src={airspaceExplorer}
                          alt="Airspace Explorer"
                          fill
                          sizes="100vw"
                          style={{
                              objectFit: "cover"
                          }}/>
                  </div>
                </CardMedia>
                <CardContent>
                  <Typography variant="h5" gutterBottom>Airspace Explorer</Typography>
                  <Typography>Get to know your facility better by visualizing the airspace encompassed by
                    vZDC.</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Link>
        </Grid>
      </Grid>
      </Container>)
  );
}
