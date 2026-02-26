'use client';

import { Snackbar, Alert } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { hideSnackbar } from '@/store/slices/uiSlice';

export default function SnackbarNotification() {
  const dispatch = useAppDispatch();
  const { open, message, severity } = useAppSelector((s) => s.ui.snackbar);

  return (
    <Snackbar open={open} autoHideDuration={4000} onClose={() => dispatch(hideSnackbar())} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
      <Alert onClose={() => dispatch(hideSnackbar())} severity={severity} variant="filled">
        {message}
      </Alert>
    </Snackbar>
  );
}
