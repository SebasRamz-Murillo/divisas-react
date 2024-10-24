import React, { useState, useEffect, useCallback, useContext } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Card, 
  CardContent, 
  Grid,
  Box,
  CircularProgress,
  InputAdornment,
  OutlinedInput,
  Pagination,
  Avatar,
  useMediaQuery,
  useTheme,
  IconButton,
  Button
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { DollarSign, Search, ArrowLeftRight } from 'lucide-react';
import { PreferenciasContexto, ReportesContexto } from './main'; 

const ITEMS_PER_PAGE = 8;

const CurrencyDashboard = () => {
  const { preferencias, cambiarPreferencias } = useContext(PreferenciasContexto);
  const { reportes, setReportes, guardarReporte } = useContext(ReportesContexto);

  const [amount, setAmount] = useState(1);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('MXN');
  const [chartData, setChartData] = useState([]);
  const [exchangeRates, setExchangeRates] = useState({});
  const [exchangeRatesHistory, setExchangeRatesHistory] = useState({});
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [flagsLoaded, setFlagsLoaded] = useState(false);

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));


  const fetchFlags = useCallback(async (currenciesList,latestRates) => {
    if (flagsLoaded || Object.keys(preferencias.map_banderas).length > 0) return;

    const flags = { ...preferencias.map_banderas };
    let hasNewFlags = false;

    for (const currency of currenciesList) {
      // Skip if we already have this flag
      if (flags[currency.code]) continue;

      if (currency.code === 'EUR') {
        flags[currency.code] = 'https://flagcdn.com/w20/eu.png';
        hasNewFlags = true;
        continue;
      }
      if (currency.code === 'USD') {
        flags[currency.code] = 'https://flagcdn.com/w40/us.png';
        hasNewFlags = true;
        continue;
      }
      try {
        const flagResponse = await fetch(`https://restcountries.com/v3.1/currency/${currency.code}`);
        const flagData = await flagResponse.json();
        if (flagData && flagData[0] && flagData[0].flags) {
          flags[currency.code] = flagData[0].flags.png;
          hasNewFlags = true;
        }
      } catch (error) {
        console.error(`Error fetching flag for ${currency.code}:`, error);
        flags[currency.code] = null;
      }
    }

    if (hasNewFlags) {
      // usar exchangeRates para tasas de cambios
      cambiarPreferencias({
        map_banderas: flags,
        lista_monedas: currenciesList.map(currency => currency.code),
        tasas_cambio: latestRates


      });
    }
    setFlagsLoaded(true);
  }, [preferencias.map_banderas, flagsLoaded, cambiarPreferencias]);

  const fetchRates = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const oneYearAgo = new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0];
      const response = await fetch(`https://api.frankfurter.app/${oneYearAgo}..${today}?base=${preferencias.moneda}`);
      const data = await response.json();

      const mostRecentDate = Object.keys(data.rates).sort().pop();
      const latestRates = data.rates[mostRecentDate];

      setExchangeRates(latestRates);
      setExchangeRatesHistory(data.rates);

      let currenciesList = Object.keys(latestRates).map(code => ({ code, name: `${code}` }));
      currenciesList.push({ code: preferencias.moneda, name: preferencias.moneda });
      setCurrencies(currenciesList);

      // Fetch flags separately
      await fetchFlags(currenciesList, latestRates);

      
      
  
  

    } catch (error) {
      console.error("Error fetching rates:", error);
    }

   
  }, [preferencias.moneda, fetchFlags]);

  // Efecto inicial para cargar datos
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchRates();
      setLoading(false);
    };
    setCurrencies(preferencias.lista_monedas.map(currency => ({ code: currency, name: currency })));
    loadData();
  }, [fetchRates]);

  // Actualizar chart data cuando cambie la moneda
  useEffect(() => {
    if (fromCurrency === preferencias.moneda) {
      // mandar datos con valor de 1 en todo el año, del primer dia del año, al actual
      const today = new Date().toISOString().split('T')[0];
      const oneYearAgo = new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0];
      const newChartData = Array.from({ length: 365 }, (_, i) => {
        const date = new Date(new Date(oneYearAgo).setDate(new Date(oneYearAgo).getDate() + i)).toISOString().split('T')[0];
        return { date, rate: 1 };
      }
      );
      setChartData(newChartData);
      return;
    }

    if (Object.keys(exchangeRatesHistory).length > 0) {
      const newChartData = Object.entries(exchangeRatesHistory)
        .map(([date, rates]) => ({
          date,
          rate: rates[fromCurrency]
        }))
        .filter(item => item.rate !== undefined);
      setChartData(newChartData);
    }
  }, [fromCurrency, exchangeRatesHistory]);

  const convert = useCallback((value, from, to) => {
    if (!exchangeRates[to] || !value) return 0;
    if (from === preferencias.moneda) {
      return (value * ( exchangeRates[to] || preferencias.tasas_cambio[to] || 1 )



      ).toFixed(3);
    } else if (to === preferencias.moneda) {
      return (value / exchangeRates[from] || preferencias.tasas_cambio[from] || 1
      ).toFixed(3);
    } else {
      const valueInUSD = value / exchangeRates[from];
      return (valueInUSD * exchangeRates[to] || preferencias.tasas_cambio[to] || 1
      ).toFixed(3);
    }
  }, [exchangeRates, preferencias.moneda]);

  const handleFromCurrencyChange = (event) => {
    setFromCurrency(event.target.value);
  };

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };
  const handleChangePage = (event, value) => {
    setCurrentPage(value);
  };


  const filteredCurrencies = currencies.filter(currency => 
    currency.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    currency.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedCurrencies = filteredCurrencies.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  const handleSaveReport = () => {
    const data = {
      divisa_De: fromCurrency,
      divisa_A: toCurrency,
      monto_divisa_d: amount,
      monto_resultante: convert(amount, fromCurrency, toCurrency),
      fecha: new Date().toISOString()
    };
    
    setReportes(prevReportes => [...(prevReportes || []), data]);
    
    // Cambiar a la vista de Historial después de guardar
    cambiarPreferencias({
      ...preferencias,
      vista_actual: 'Historial'
    });
  };

  const handleViewHistory = () => {
    cambiarPreferencias({
      ...preferencias,
      vista_actual: 'Historial'
    });
  }



  return (
    <Box sx={{ bgcolor: 'grey.100', minHeight: '100vh', py: 4 }}>
      <Container maxWidth={isDesktop ? "lg" : "md"}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4, color: 'primary.main' }}>
          Divisas "Patito"
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card sx={{ mb: 4, border: '1px solid black' }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={5}>
                  <FormControl fullWidth>
                      <InputLabel>De</InputLabel>
                      <Select
                        value={fromCurrency}
                        onChange={handleFromCurrencyChange}
                        input={<OutlinedInput label="De" />}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar 
                              src={preferencias.map_banderas[selected]} 
                              sx={{ width: isDesktop ? 32 : 24, height: isDesktop ? 32 : 24, mr: 1 }} 
                            />
                            {selected}
                          </Box>
                        )}
                      >
                        {currencies.map((currency) => (
                          <MenuItem key={currency.code} value={currency.code}>
                            <Avatar 
                              src={preferencias.map_banderas[currency.code]} 
                              sx={{ width: isDesktop ? 32 : 24, height: isDesktop ? 32 : 24, mr: 1 }} 
                            />
                            {currency.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      label={`Monto en ${fromCurrency}`}
                      variant="outlined"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      sx={{ mt: 2 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <DollarSign size={20} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <IconButton onClick={handleSwapCurrencies} color="primary" sx={{ transform: isDesktop ? 'scale(1.5)' : 'scale(1)' }}>
                      <ArrowLeftRight />
                    </IconButton>
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <FormControl fullWidth>
                      <InputLabel>A</InputLabel>
                      <Select
                        value={toCurrency}
                        onChange={(e) => setToCurrency(e.target.value)}
                        input={<OutlinedInput label="A" />}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar src={preferencias.map_banderas[selected]} sx={{ width: isDesktop ? 32 : 24, height: isDesktop ? 32 : 24, mr: 1 }} />
                            {selected}
                          </Box>
                        )}
                      >
                        {currencies.map((currency) => (
                          <MenuItem key={currency.code} value={currency.code}>
                            <Avatar src={preferencias.map_banderas[currency.code]} sx={{ width: isDesktop ? 32 : 24, height: isDesktop ? 32 : 24, mr: 1 }} />
                            {currency.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      label={`Monto en ${toCurrency}`}
                      variant="outlined"
                      value={convert(amount, fromCurrency, toCurrency)}
                      InputProps={{
                        readOnly: true,
                        startAdornment: (
                          <InputAdornment position="start">
                            <DollarSign size={20} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mt: 2 }}
                    />
                  </Grid>
                  
                </Grid>
                {//Boton para generar reporte

                }
                < Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSaveReport}
                  >
                    Generar Reporte
                  </Button>

                    
                </Box>
                < Box sx={{ display: 'flex', justifyContent: 'right', mt: 2 }}>

                <Button
                    onClick={handleViewHistory}
                    sx={{ ml: 2 }}
                  >
                    Ver Historial
                  </Button>
                  </Box>


              </CardContent>
            </Card>

            <Card sx={{ mb: 4, border: '1px solid black' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Historial de tipo de cambio en base a la moneda base de las preferencias ({preferencias.moneda}/{fromCurrency})
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <XAxis dataKey="date" />
                    <YAxis domain={['auto', 'auto']} />
                    <Tooltip />
                    <Line type="monotone" dataKey="rate" stroke="#1976d2" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            
            <Card sx={{ mb: 4, border: '1px solid black' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Otras Conversiones
                </Typography>
                <TextField
                  fullWidth
                  label="Buscar divisa"
                  variant="outlined"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search size={20} />
                      </InputAdornment>
                    ),
                  }}
                />
                <Grid container spacing={2}>
                  {paginatedCurrencies.filter(c => c.code !== fromCurrency && c.code !== toCurrency).map((currency) => (
                    <Grid item xs={12} sm={6} key={currency.code}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Avatar src={preferencias.map_banderas[currency.code]} sx={{ width: isDesktop ? 32 : 24, height: isDesktop ? 32 : 24, mr: 1 }} />
                            <Typography variant={isDesktop ? 'h6' : 'body1'} color="textSecondary">
                              {currency.name}
                            </Typography>
                          </Box>
                          <Typography variant={isDesktop ? 'h5' : 'h6'} component="h2">
                            {convert(amount, fromCurrency, currency.code)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Pagination 
                    count={Math.ceil(filteredCurrencies.length / ITEMS_PER_PAGE)} 
                    page={currentPage} 
                    onChange={handleChangePage} 
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CurrencyDashboard;