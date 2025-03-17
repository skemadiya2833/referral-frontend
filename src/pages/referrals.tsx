'use client';

import React, { useEffect, useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Container,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Snackbar,
    IconButton,
    CircularProgress,
    Box
} from '@mui/material';
import { Add, Close, Logout } from '@mui/icons-material';
import { getAuthToken, removeAuthToken } from '@/utils/auth';
import router from 'next/router';

interface Referral {
    email: string;
    status: 'pending' | 'accepted';
    code: string;
}

const ReferralsPage: React.FC = () => {
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [open, setOpen] = useState(false);
    const [newReferralEmail, setNewReferralEmail] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [isClient, setIsClient] = useState(false);

    // Ensure client-side rendering to avoid hydration error
    useEffect(() => {
        setIsClient(true);
        fetchReferrals();
    }, []);

    // Fetch referrals from the server
    const fetchReferrals = async () => {
        try {
            setLoading(true);
            const token = getAuthToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/referrals`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch referrals');
            }

            const data = await response.json();
            setReferrals(data?.status?.data ?? []);
        } catch (error) {
            setSnackbarMessage('Failed to fetch referrals');
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    // Handle dialog open/close
    const handleClickOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    // Handle snackbar close
    const handleSnackbarClose = () => setSnackbarOpen(false);

    // Handle sending a referral with loader and snackbar for error
    const handleRefer = async () => {
        if (sending) return;

        try {
            if (!newReferralEmail.trim()) {
                setSnackbarMessage('Please enter a valid email address.');
                setSnackbarOpen(true);
                return;
            }

            setSending(true);

            const token = getAuthToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/referrals`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: newReferralEmail }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setSnackbarMessage(errorData?.message || 'User is already referred by someone');
                setSnackbarOpen(true);
                return;
            }

            const data = await response.json();
            console.log(data);

            fetchReferrals(); // Refresh the list
            setOpen(false);
            setSnackbarMessage('Referral sent successfully!');
            setSnackbarOpen(true);
            setNewReferralEmail(''); // Clear input
        } catch (error) {
            setSnackbarMessage('User is already referred by someone');
            setSnackbarOpen(true);
        } finally {
            setSending(false);
        }
    };

    // Handle logout with snackbar on failure
    const handleLogOut = async () => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logout`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                setSnackbarMessage('Failed to log out');
                setSnackbarOpen(true);
                return;
            }

            removeAuthToken();
            router.push('/login');
        } catch (error) {
            setSnackbarMessage('Failed to log out');
            setSnackbarOpen(true);
        }
    };

    // Prevent SSR mismatch using isClient check
    if (!isClient) {
        return null;
    }

    return (
        <Box sx={{ backgroundColor: '#121212', minHeight: '100vh', color: '#fff', paddingTop: '20px' }}>
            {/* Header Section */}
            <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6">Referral Management</Typography>
                    <IconButton onClick={handleLogOut} sx={{ color: 'white' }}>
                        <Logout />
                    </IconButton>
                </Toolbar>
            </AppBar>

            {/* Main Section */}
            <Container maxWidth="md">
                <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', margin: '20px 0' }}>
                    Your Referrals
                </Typography>

                {/* Loader while fetching data */}
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                        <CircularProgress color="primary" />
                    </Box>
                ) : (
                    <TableContainer component={Paper} sx={{ backgroundColor: '#1e1e1e', color: '#fff' }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#1976d2' }}>
                                    <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Email</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Referral code</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {referrals.map((referral, index) => (
                                    <TableRow key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#282828' } }}>
                                        <TableCell sx={{ color: '#fff' }}>{referral.email}</TableCell>
                                        <TableCell sx={{ color: '#fff' }}>{referral.code}</TableCell>
                                        <TableCell sx={{ color: referral.status === 'accepted' ? 'lightgreen' : 'orange' }}>
                                            {referral.status}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {/* Add Referral Button */}
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleClickOpen}
                    sx={{ display: 'block', margin: '20px auto', padding: '10px 20px', fontSize: '16px' }}
                >
                    Refer a New User
                </Button>

                {/* Referral Dialog */}
                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>Refer a New User</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Email Address"
                            type="email"
                            fullWidth
                            value={newReferralEmail}
                            onChange={(e) => setNewReferralEmail(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="secondary" disabled={sending}>
                            Cancel
                        </Button>
                        <Button onClick={handleRefer} color="primary" disabled={sending}>
                            {sending ? <CircularProgress size={24} color="inherit" /> : 'Send Referral'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Snackbar for notifications */}
                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={3000}
                    onClose={handleSnackbarClose}
                    message={snackbarMessage}
                    action={
                        <IconButton size="small" color="inherit" onClick={handleSnackbarClose}>
                            <Close fontSize="small" />
                        </IconButton>
                    }
                />
            </Container>
        </Box>
    );
};

export default ReferralsPage;