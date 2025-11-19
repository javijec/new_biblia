import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
    Box,
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Drawer,
    Container,
    Paper,
    InputBase,
    Fade,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import Sidebar from "../components/Sidebar";
import { useBible } from "../context/BibleContext";

export default function MainLayout() {
    const { data } = useBible();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
            setSearchOpen(false);
            setMobileOpen(false);
        }
    };

    const handleNavigation = (path) => {
        navigate(path);
        if (isMobile) setMobileOpen(false);
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", bgcolor: "background.default" }}>
            {/* AppBar */}
            <AppBar position="static" elevation={0} sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
                <Toolbar sx={{ gap: 2, minHeight: { xs: 56, sm: 64 } }}>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 1, display: { md: "none" } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            cursor: "pointer",
                            flexShrink: 0,
                        }}
                        onClick={() => navigate("/")}
                    >
                        <Box
                            sx={{
                                bgcolor: "primary.main",
                                color: "white",
                                p: 0.5,
                                borderRadius: 1,
                                display: "flex",
                            }}
                        >
                            <MenuBookIcon sx={{ fontSize: 24 }} />
                        </Box>
                        <Box>
                            <Typography
                                variant="h6"
                                component="h1"
                                sx={{
                                    fontWeight: 700,
                                    lineHeight: 1.2,
                                    color: "text.primary",
                                    fontSize: { xs: "1rem", sm: "1.1rem" },
                                }}
                            >
                                Biblia Digital
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: "text.secondary",
                                    display: { xs: "none", sm: "block" },
                                    lineHeight: 1,
                                }}
                            >
                                Pueblo de Dios
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ flexGrow: 1 }} />

                    <Fade in={searchOpen}>
                        <Paper
                            component="form"
                            onSubmit={handleSearchSubmit}
                            elevation={0}
                            sx={{
                                p: "2px 8px",
                                display: searchOpen ? "flex" : "none",
                                alignItems: "center",
                                width: { xs: "100%", sm: 300, md: 400 },
                                backgroundColor: "grey.100",
                                position: { xs: "absolute", sm: "relative" },
                                left: { xs: 0, sm: "auto" },
                                right: { xs: 0, sm: "auto" },
                                top: { xs: "100%", sm: "auto" },
                                mx: { xs: 0, sm: 0 },
                                zIndex: 10,
                                borderBottom: { xs: "1px solid #e5e7eb", sm: "none" },
                                borderRadius: { xs: 0, sm: 8 },
                            }}
                        >
                            <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />
                            <InputBase
                                autoFocus
                                sx={{ ml: 1, flex: 1 }}
                                placeholder="Buscar..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <IconButton
                                    size="small"
                                    onClick={() => setSearchTerm("")}
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            )}
                        </Paper>
                    </Fade>

                    <IconButton
                        onClick={() => {
                            setSearchOpen(!searchOpen);
                            if (!searchOpen) setTimeout(() => document.querySelector('input[placeholder="Buscar..."]')?.focus(), 100);
                        }}
                        sx={{
                            bgcolor: searchOpen ? "grey.100" : "transparent",
                            color: searchOpen ? "primary.main" : "text.secondary"
                        }}
                    >
                        {searchOpen ? <CloseIcon /> : <SearchIcon />}
                    </IconButton>
                </Toolbar>
            </AppBar>

            {/* Main Content Wrapper */}
            <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
                {/* Desktop Sidebar */}
                <Box
                    component="nav"
                    sx={{
                        width: { md: 300, lg: 340 },
                        flexShrink: 0,
                        display: { xs: "none", md: "block" },
                        borderRight: "1px solid",
                        borderColor: "divider",
                        bgcolor: "white",
                    }}
                >
                    <Sidebar
                        data={data}
                        onNavigate={handleNavigation}
                    />
                </Box>

                {/* Mobile Drawer */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: "block", md: "none" },
                        "& .MuiDrawer-paper": {
                            width: 280,
                            boxSizing: "border-box",
                            bgcolor: "white",
                        },
                    }}
                >
                    <Sidebar
                        data={data}
                        onNavigate={handleNavigation}
                    />
                </Drawer>

                {/* Page Content */}
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        overflow: "auto",
                        bgcolor: "background.default",
                        position: "relative",
                    }}
                >
                    <Container
                        maxWidth="lg"
                        sx={{
                            height: "100%",
                            py: { xs: 2, md: 4 },
                            px: { xs: 2, md: 4 }
                        }}
                    >
                        <Outlet />
                    </Container>
                </Box>
            </Box>
        </Box>
    );
}
