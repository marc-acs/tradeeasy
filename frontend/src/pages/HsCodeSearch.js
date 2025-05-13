import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { hsCodeAPI } from '../services/api';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  Chip,
  IconButton,
  InputAdornment,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  TrendingUp as TrendingUpIcon,
  Calculate as CalculateIcon
} from '@mui/icons-material';

export default function HsCodeSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [savedHsCodes, setSavedHsCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [section, setSection] = useState('');
  const [sections, setSections] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [chapter, setChapter] = useState('');
  
  // Fetch saved HS codes
  useEffect(() => {
    async function fetchSavedHsCodes() {
      try {
        const response = await hsCodeAPI.getSaved();
        setSavedHsCodes(response.data.data.hsCodes);
      } catch (err) {
        console.error('Error fetching saved HS codes:', err);
      }
    }
    
    fetchSavedHsCodes();
    
    // Fetch available sections and chapters
    fetchFilters();
  }, []);
  
  // Fetch filters (sections and chapters)
  const fetchFilters = async () => {
    try {
      // In a real implementation, these would be fetched from the API
      // For now, we'll use some sample data
      setSections([
        { id: '1', name: 'Live Animals; Animal Products' },
        { id: '2', name: 'Vegetable Products' },
        { id: '3', name: 'Animal or Vegetable Fats and Oils' },
        { id: '4', name: 'Prepared Foodstuffs; Beverages, Spirits; Tobacco' },
        { id: '5', name: 'Mineral Products' },
        { id: '6', name: 'Chemical Products' },
        { id: '7', name: 'Plastics and Rubber' },
        { id: '8', name: 'Leather, Travel Goods' },
        { id: '9', name: 'Wood and Wood Products' },
        { id: '10', name: 'Wood Pulp Products' },
        { id: '11', name: 'Textiles and Textile Articles' },
        { id: '12', name: 'Footwear, Headgear, Umbrellas' },
        { id: '13', name: 'Stone, Plaster, Cement, Ceramic, Glass' },
        { id: '14', name: 'Pearls, Precious Stones and Metals' },
        { id: '15', name: 'Base Metals and Articles' },
        { id: '16', name: 'Machinery, Electrical Equipment' },
        { id: '17', name: 'Vehicles, Aircraft, Vessels' },
        { id: '18', name: 'Optical, Photographic, Medical Instruments' },
        { id: '19', name: 'Arms and Ammunition' },
        { id: '20', name: 'Miscellaneous Manufactured Articles' },
        { id: '21', name: 'Works of Art, Collectors\' Pieces and Antiques' }
      ]);
      
      setChapters([
        { id: '01', name: 'Live Animals', section: '1' },
        { id: '02', name: 'Meat and Edible Meat Offal', section: '1' },
        { id: '03', name: 'Fish and Crustaceans', section: '1' },
        { id: '04', name: 'Dairy Produce; Bird\'s Eggs; Honey', section: '1' },
        { id: '05', name: 'Products of Animal Origin', section: '1' },
        { id: '06', name: 'Live Trees and Other Plants', section: '2' },
        { id: '07', name: 'Edible Vegetables', section: '2' },
        { id: '08', name: 'Edible Fruit and Nuts', section: '2' },
        { id: '09', name: 'Coffee, Tea, and Spices', section: '2' },
        { id: '10', name: 'Cereals', section: '2' },
        { id: '11', name: 'Milling Industry Products', section: '2' },
        { id: '12', name: 'Oil Seeds and Oleaginous Fruits', section: '2' }
      ]);
    } catch (err) {
      console.error('Error fetching filters:', err);
    }
  };
  
  // Search for HS codes
  const handleSearch = async (pageNum = 1) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await hsCodeAPI.search({
        search: searchTerm,
        section: section,
        chapter: chapter,
        page: pageNum,
        limit: 12
      });
      
      setSearchResults(response.data.data.hsCodes);
      setTotalPages(response.data.pagination.totalPages);
      setPage(pageNum);
    } catch (err) {
      console.error('Error searching HS codes:', err);
      setError(typeof err === 'string' ? err : 'Failed to search HS codes. Please try again.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle section change and update available chapters
  const handleSectionChange = (e) => {
    const newSection = e.target.value;
    setSection(newSection);
    setChapter(''); // Reset chapter when section changes
  };
  
  // Handle pagination
  const handlePageChange = (event, value) => {
    setPage(value);
    handleSearch(value);
  };
  
  // Handle saving/unsaving HS code
  const handleToggleSave = async (hsCode) => {
    try {
      const isAlreadySaved = savedHsCodes.some(item => item.code === hsCode.code);
      
      if (isAlreadySaved) {
        await hsCodeAPI.unsave(hsCode.code);
        setSavedHsCodes(savedHsCodes.filter(item => item.code !== hsCode.code));
      } else {
        await hsCodeAPI.save(hsCode.code);
        setSavedHsCodes([...savedHsCodes, hsCode]);
      }
    } catch (err) {
      console.error('Error toggling save status:', err);
    }
  };
  
  return (
    <Box>
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          Search HS Codes
        </Typography>
        
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} md={5}>
            <TextField
              label="Search HS codes"
              variant="outlined"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter code or description"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={() => handleSearch()}
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} /> : <SearchIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="section-select-label">Section</InputLabel>
              <Select
                labelId="section-select-label"
                id="section-select"
                value={section}
                onChange={handleSectionChange}
                label="Section"
              >
                <MenuItem value="">
                  <em>All Sections</em>
                </MenuItem>
                {sections.map((sec) => (
                  <MenuItem key={sec.id} value={sec.id}>
                    {sec.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="chapter-select-label">Chapter</InputLabel>
              <Select
                labelId="chapter-select-label"
                id="chapter-select"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                label="Chapter"
                disabled={!section} // Disable if no section selected
              >
                <MenuItem value="">
                  <em>All Chapters</em>
                </MenuItem>
                {chapters
                  .filter((ch) => !section || ch.section === section)
                  .map((ch) => (
                    <MenuItem key={ch.id} value={ch.id}>
                      {ch.id} - {ch.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={1}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => handleSearch()}
              disabled={loading}
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}
      
      {!loading && searchResults.length === 0 && (
        <Paper elevation={0} sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
          <Typography color="text.secondary">
            {searchTerm || section || chapter 
              ? 'No HS codes found matching your search criteria'
              : 'Enter search terms or select filters to find HS codes'}
          </Typography>
        </Paper>
      )}
      
      {!loading && searchResults.length > 0 && (
        <>
          <Grid container spacing={2}>
            {searchResults.map((hsCode) => {
              const isAlreadySaved = savedHsCodes.some(item => item.code === hsCode.code);
              
              return (
                <Grid item xs={12} sm={6} md={4} key={hsCode.code}>
                  <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            {hsCode.code}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Section: {hsCode.section}, Chapter: {hsCode.chapter}
                          </Typography>
                        </Box>
                        <IconButton
                          onClick={() => handleToggleSave(hsCode)}
                          color={isAlreadySaved ? 'primary' : 'default'}
                        >
                          {isAlreadySaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                        </IconButton>
                      </Box>
                      <Typography variant="body1">
                        {hsCode.description}
                      </Typography>
                    </CardContent>
                    <Divider />
                    <CardActions>
                      <Button
                        component={RouterLink}
                        to={`/prices/${hsCode.code}`}
                        size="small"
                        startIcon={<TrendingUpIcon />}
                      >
                        Prices
                      </Button>
                      <Button
                        component={RouterLink}
                        to={`/tariffs/${hsCode.code}`}
                        size="small"
                        startIcon={<CalculateIcon />}
                      >
                        Tariffs
                      </Button>
                      <Button
                        component={RouterLink}
                        to={`/forecast/${hsCode.code}`}
                        size="small"
                      >
                        Forecast
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
          
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}