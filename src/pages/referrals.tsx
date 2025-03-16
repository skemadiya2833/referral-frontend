import React, { useEffect, useState } from 'react';
import router from 'next/router';
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
    Box,
} from '@mui/material';
import { Add, Close, Logout } from '@mui/icons-material';
import { getAuthToken, removeAuthToken } from '@/utils/auth';

interface Referral {
    email: string;
    status: 'pending' | 'accepted';
}

const ReferralsPage: React.FC = () => {
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [open, setOpen] = useState(false);
    const [newReferralEmail, setNewReferralEmail] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    useEffect(() => {
        fetchReferrals();
    }, []);

    const fetchReferrals = async () => {
        try {
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
            // console.error('Error fetching referrals:', error);
        }
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const handleRefer = async () => {
        try {
            if (!newReferralEmail.trim()) {
                alert("Please enter a valid email address.");
                return;
            }
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
                throw new Error('Failed to send referral');
            }

            const data = await response.json();
            console.log(data);
            fetchReferrals();
            setOpen(false);
            setSnackbarOpen(true);
        } catch (error) {
            console.log('Error sending referral:', error);
        }
    };

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
            const data = await response.json();
            console.log(data);
            removeAuthToken();
            router.push('/login');
        } catch (error) {
            console.log('Error sending referral:', error);
        }
    };

    return (
        <Box sx={{ backgroundColor: '#121212', minHeight: '100vh', color: '#fff', paddingTop: '20px' }}>
            <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6">
                        Referral Management
                    </Typography>
                    <IconButton onClick={handleLogOut} sx={{ color: 'white' }}>
                        <Logout />
                    </IconButton>
                </Toolbar>
            </AppBar>


            <Container maxWidth="md">
                <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', margin: '20px 0' }}>
                    Your Referrals
                </Typography>

                <TableContainer component={Paper} sx={{ backgroundColor: '#1e1e1e', color: '#fff', overflowX: 'auto' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#1976d2' }}>
                                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Email</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {referrals.map((referral, index) => (
                                <TableRow key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#282828' } }}>
                                    <TableCell sx={{ color: '#fff' }}>{referral.email}</TableCell>
                                    <TableCell sx={{ color: referral.status === 'accepted' ? 'lightgreen' : 'orange' }}>
                                        {referral.status}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleClickOpen}
                    sx={{ display: 'block', margin: '20px auto', padding: '10px 20px', fontSize: '16px' }}
                >
                    Refer a New User
                </Button>

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
                        <Button onClick={handleClose} color="secondary">
                            Cancel
                        </Button>
                        <Button onClick={handleRefer} color="primary">
                            Send Referral
                        </Button>
                    </DialogActions>
                </Dialog>

                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={3000}
                    onClose={handleSnackbarClose}
                    message="Referral sent successfully!"
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