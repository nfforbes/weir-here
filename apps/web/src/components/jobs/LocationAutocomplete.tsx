'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Autocomplete, TextField, TextFieldProps, Button, InputAdornment } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'WeirHereStaffing/1.0 (job location search)';

const LocationMapPicker = dynamic(
  () => import('@/components/jobs/LocationMapPicker'),
  { ssr: false },
);

export interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
}

async function searchNominatim(query: string): Promise<NominatimResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];

  const params = new URLSearchParams({
    format: 'json',
    q: trimmed,
    addressdetails: '1',
    limit: '8',
  });
  const res = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
    headers: {
      'Accept-Language': 'en',
      'User-Agent': USER_AGENT,
    },
    method: 'GET',
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export interface LocationAutocompleteProps
  extends Omit<TextFieldProps, 'value' | 'onChange' | 'inputRef'> {
  value: string;
  onChange: (value: string) => void;
}

export default function LocationAutocomplete({
  value,
  onChange,
  disabled,
  error,
  helperText,
  ...textFieldProps
}: LocationAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [options, setOptions] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mapPickerOpen, setMapPickerOpen] = useState(false);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const fetchOptions = useCallback((query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 3) {
      setOptions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      searchNominatim(query)
        .then((results) => {
          setOptions(results);
        })
        .catch(() => setOptions([]))
        .finally(() => setLoading(false));
    }, 400);
  }, []);

  const handleInputChange = useCallback(
    (_: unknown, newInputValue: string) => {
      setInputValue(newInputValue);
      onChange(newInputValue);
      fetchOptions(newInputValue);
    },
    [onChange, fetchOptions],
  );

  const handleChange = useCallback(
    (_: unknown, newValue: string | NominatimResult | null) => {
      const str = typeof newValue === 'string' ? newValue : newValue?.display_name ?? '';
      setInputValue(str);
      onChange(str);
      setOptions([]);
      setOpen(false);
    },
    [onChange],
  );

  const handleBlur = useCallback(() => {
    setOpen(false);
  }, []);

  const handleFocus = useCallback(() => {
    if (inputValue.trim().length >= 3) fetchOptions(inputValue);
    setOpen(true);
  }, [inputValue, fetchOptions]);

  const optionLabel = useCallback((option: string | NominatimResult) => {
    return typeof option === 'string' ? option : option.display_name;
  }, []);

  const handleMapSelect = useCallback(
    (address: string) => {
      setInputValue(address);
      onChange(address);
      setMapPickerOpen(false);
    },
    [onChange],
  );

  return (
    <>
    <Autocomplete
      freeSolo
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      onBlur={handleBlur}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      value={value}
      onChange={handleChange}
      options={options}
      getOptionLabel={optionLabel}
      loading={loading}
      disabled={disabled}
      sx={{ minWidth: '56ch' }}
      isOptionEqualToValue={(option, v) => {
        const o = typeof option === 'string' ? option : option.display_name;
        const val = typeof v === 'string' ? v : (v as NominatimResult).display_name;
  return o === val;
  }}
  renderInput={(params) => (
    <TextField
      {...params}
      {...textFieldProps}
      label={textFieldProps.label ?? 'Location'}
      required={textFieldProps.required}
      error={error}
      helperText={helperText ?? (disabled ? undefined : 'Search by address or pick on map (OpenStreetMap)')}
      placeholder={disabled ? undefined : 'Search for a location or enter address'}
      onFocus={handleFocus}
      sx={
        !disabled
          ? {
              '& .MuiInputBase-input': {
                paddingRight: 140,
                fontSize: '1rem',
              },
            }
          : undefined
      }
      InputProps={{
        ...params.InputProps,
        endAdornment: (
          <>
            {params.InputProps.endAdornment}
            {!disabled && (
              <InputAdornment position="end" sx={{ position: 'absolute', right: 40 }}>
                <Button
                  size="small"
                  startIcon={<MapIcon />}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setMapPickerOpen(true);
                  }}
                  sx={{ minWidth: 'auto', px: 1 }}
                >
                  Pick on map
                </Button>
              </InputAdornment>
            )}
          </>
        ),
      }}
    />
  )}
    />
      <LocationMapPicker
        open={mapPickerOpen}
        onClose={() => setMapPickerOpen(false)}
        onSelect={handleMapSelect}
      />
  </>
  );
}
