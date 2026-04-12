import {Card, CardContent, List, ListItemButton, ListItemIcon, ListItemText, Typography} from '@mui/material';
import Link from 'next/link';
import React from 'react';
import {Home, ListAlt, Radar, ToggleOn, Tune, Wallpaper,} from "@mui/icons-material";

export default function AdminMenu() {
    return (
        <Card>
            <CardContent>
                <Typography variant="h6" sx={{ textAlign: 'center' }}>A.S.X. Management</Typography>
                <List>
                    <Link href="/admin" style={{textDecoration: 'none', color: 'inherit',}}>
                        <ListItemButton>
                            <ListItemIcon>
                                <Home/>
                            </ListItemIcon>
                            <ListItemText primary="Overview"/>
                        </ListItemButton>
                    </Link>
                    <Link href="/admin/containers" style={{textDecoration: 'none', color: 'inherit',}}>
                        <ListItemButton>
                            <ListItemIcon>
                                <Tune/>
                            </ListItemIcon>
                            <ListItemText primary="Airspace Condition Containers"/>
                        </ListItemButton>
                    </Link>
                    <Link href="/admin/facilities" style={{textDecoration: 'none', color: 'inherit',}}>
                        <ListItemButton>
                            <ListItemIcon>
                                <Radar />
                            </ListItemIcon>
                            <ListItemText primary="Radar Facilities"/>
                        </ListItemButton>
                    </Link>
                    <Link href="/admin/video-maps" style={{textDecoration: 'none', color: 'inherit',}}>
                        <ListItemButton>
                            <ListItemIcon>
                                <Wallpaper />
                            </ListItemIcon>
                            <ListItemText primary="Video Maps"/>
                        </ListItemButton>
                    </Link>

                    <Link href="/admin/defaults" style={{textDecoration: 'none', color: 'inherit',}}>
                        <ListItemButton>
                            <ListItemIcon>
                                <ToggleOn/>
                            </ListItemIcon>
                            <ListItemText primary="Default Active Conditions"/>
                        </ListItemButton>
                    </Link>


                    <Link href="/admin/logs" style={{textDecoration: 'none', color: 'inherit',}}>
                        <ListItemButton>
                            <ListItemIcon>
                                <ListAlt/>
                            </ListItemIcon>
                            <ListItemText primary="Logs"/>
                        </ListItemButton>
                    </Link>
                </List>
            </CardContent>
        </Card>
    );
}