import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Upload as UploadIcon
} from '@mui/icons-material';

// Mock data
const MOCK_HS_CODES = [
  { code: '120190', description: 'Soybeans, whether or not broken', category: 'Agricultural Products' },
  { code: '020130', description: 'Fresh or chilled bovine meat, boneless', category: 'Food Products' },
  { code: '843149', description: 'Parts of lifting, handling, loading or unloading machinery', category: 'Machinery' },
  { code: '271019', description: 'Medium oils and preparations, of petroleum', category: 'Mineral Products' },
  { code: '840991', description: 'Parts suitable for use solely or principally with spark-ignition internal combustion piston engine', category: 'Machinery' }
];

const MOCK_PRICE_DATA = [
  { id: '1', hsCode: '120190', date: '2023-04-15', price: 567.32, currency: 'USD', unit: 'ton' },
  { id: '2', hsCode: '120190', date: '2023-04-01', price: 562.18, currency: 'USD', unit: 'ton' },
  { id: '3', hsCode: '020130', date: '2023-04-15', price: 4.85, currency: 'USD', unit: 'kg' },
  { id: '4', hsCode: '020130', date: '2023-04-01', price: 4.92, currency: 'USD', unit: 'kg' },
  { id: '5', hsCode: '843149', date: '2023-04-15', price: 132.50, currency: 'USD', unit: 'unit' }
];

const MOCK_TARIFF_DATA = [
  { id: '1', hsCode: '120190', sourceCountry: 'ARG', destinationCountry: 'USA', rate: 0, specialProgram: 'GSP', dateUpdated: '2023-01-15' },
  { id: '2', hsCode: '020130', sourceCountry: 'ARG', destinationCountry: 'USA', rate: 4.4, specialProgram: null, dateUpdated: '2023-01-15' },
  { id: '3', hsCode: '843149', sourceCountry: 'ARG', destinationCountry: 'USA', rate: 0, specialProgram: 'GSP', dateUpdated: '2023-01-15' },
  { id: '4', hsCode: '271019', sourceCountry: 'ARG', destinationCountry: 'USA', rate: 7, specialProgram: null, dateUpdated: '2023-01-15' },
  { id: '5', hsCode: '840991', sourceCountry: 'ARG', destinationCountry: 'USA', rate: 2.5, specialProgram: null, dateUpdated: '2023-01-15' }
];

const MOCK_RISK_DATA = [
  { id: '1', title: 'Drought in Argentina', description: 'Drought conditions affecting major soybean growing regions', severity: 4, affectedHsCodes: ['120190'], isActive: true, expectedPriceImpact: { direction: 'increase', percentage: 15 } },
  { id: '2', title: 'New Export Tax', description: 'Potential new export tax on agricultural products', severity: 3, affectedHsCodes: ['120190', '020130'], isActive: true, expectedPriceImpact: { direction: 'increase', percentage: 8 } },
  { id: '3', title: 'Port Strike', description: 'Workers strike at major shipping ports', severity: 2, affectedHsCodes: ['120190', '020130', '843149'], isActive: false, expectedPriceImpact: { direction: 'increase', percentage: 5 } },
  { id: '4', title: 'Shipping Container Shortage', description: 'Global shortage of shipping containers increasing freight costs', severity: 3, affectedHsCodes: ['120190', '020130', '843149', '271019'], isActive: true, expectedPriceImpact: { direction: 'increase', percentage: 7 } }
];

const DataManagement = () => {
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  
  // State for each data type
  const [hsCodes, setHsCodes] = useState(MOCK_HS_CODES);
  const [priceData, setPriceData] = useState(MOCK_PRICE_DATA);
  const [tariffData, setTariffData] = useState(MOCK_TARIFF_DATA);
  const [riskData, setRiskData] = useState(MOCK_RISK_DATA);
  
  // Form data for dialog
  const [formData, setFormData] = useState({});

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
    setSearchTerm('');
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleOpenDialog = (item = null) => {
    setCurrentItem(item);
    
    if (item) {
      // Edit mode - set form data based on current item
      setFormData(item);
    } else {
      // Add mode - set empty form data based on current tab
      switch (tabValue) {
        case 0: // HS Codes
          setFormData({ code: '', description: '', category: '' });
          break;
        case 1: // Price Data
          setFormData({ hsCode: '', date: new Date().toISOString().split('T')[0], price: '', currency: 'USD', unit: '' });
          break;
        case 2: // Tariff Data
          setFormData({ hsCode: '', sourceCountry: 'ARG', destinationCountry: 'USA', rate: '', specialProgram: '', dateUpdated: new Date().toISOString().split('T')[0] });
          break;
        case 3: // Risk Data
          setFormData({ 
            title: '', 
            description: '', 
            severity: 1, 
            affectedHsCodes: [], 
            isActive: true, 
            expectedPriceImpact: { direction: 'increase', percentage: 0 } 
          });
          break;
        default:
          setFormData({});
      }
    }
    
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = () => {
    // Handle form submission based on current tab
    switch (tabValue) {
      case 0: // HS Codes
        if (currentItem) {
          // Update existing HS code
          setHsCodes(hsCodes.map(item => 
            item.code === currentItem.code ? formData : item
          ));
        } else {
          // Add new HS code
          setHsCodes([...hsCodes, formData]);
        }
        break;
      case 1: // Price Data
        if (currentItem) {
          // Update existing price data
          setPriceData(priceData.map(item => 
            item.id === currentItem.id ? formData : item
          ));
        } else {
          // Add new price data
          const newItem = { 
            ...formData, 
            id: Math.random().toString(36).substr(2, 9)
          };
          setPriceData([...priceData, newItem]);
        }
        break;
      case 2: // Tariff Data
        if (currentItem) {
          // Update existing tariff data
          setTariffData(tariffData.map(item => 
            item.id === currentItem.id ? formData : item
          ));
        } else {
          // Add new tariff data
          const newItem = { 
            ...formData, 
            id: Math.random().toString(36).substr(2, 9)
          };
          setTariffData([...tariffData, newItem]);
        }
        break;
      case 3: // Risk Data
        if (currentItem) {
          // Update existing risk data
          setRiskData(riskData.map(item => 
            item.id === currentItem.id ? formData : item
          ));
        } else {
          // Add new risk data
          const newItem = { 
            ...formData, 
            id: Math.random().toString(36).substr(2, 9)
          };
          setRiskData([...riskData, newItem]);
        }
        break;
      default:
        // Do nothing
    }
    
    handleCloseDialog();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      switch (tabValue) {
        case 0: // HS Codes
          setHsCodes(hsCodes.filter(item => item.code !== id));
          break;
        case 1: // Price Data
          setPriceData(priceData.filter(item => item.id !== id));
          break;
        case 2: // Tariff Data
          setTariffData(tariffData.filter(item => item.id !== id));
          break;
        case 3: // Risk Data
          setRiskData(riskData.filter(item => item.id !== id));
          break;
        default:
          // Do nothing
      }
    }
  };

  const handleRefreshData = () => {
    // In a real app, this would fetch fresh data from the API
    alert('Data would be refreshed from API in a real application');
  };

  const handleBulkUpload = () => {
    // In a real app, this would open a file upload dialog
    alert('Bulk upload functionality would be implemented in a real application');
  };

  // Filter data based on search term and current tab
  const getFilteredData = () => {
    switch (tabValue) {
      case 0: // HS Codes
        return hsCodes.filter(item => 
          item.code.includes(searchTerm) || 
          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
      case 1: // Price Data
        return priceData.filter(item => 
          item.hsCode.includes(searchTerm) || 
          item.date.includes(searchTerm) ||
          item.price.toString().includes(searchTerm)
        );
      case 2: // Tariff Data
        return tariffData.filter(item => 
          item.hsCode.includes(searchTerm) || 
          item.sourceCountry.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.destinationCountry.toLowerCase().includes(searchTerm.toLowerCase())
        );
      case 3: // Risk Data
        return riskData.filter(item => 
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.affectedHsCodes.some(code => code.includes(searchTerm))
        );
      default:
        return [];
    }
  };

  const renderTabContent = () => {
    const filteredData = getFilteredData();
    
    return (
      <>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ width: '30%' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Box>
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />} 
              onClick={handleRefreshData}
              sx={{ mr: 1 }}
            >
              Refresh Data
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<UploadIcon />} 
              onClick={handleBulkUpload}
              sx={{ mr: 1 }}
            >
              Bulk Upload
            </Button>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={() => handleOpenDialog()}
            >
              Add New
            </Button>
          </Box>
        </Box>
        
        <TableContainer component={Paper}>
          {tabValue === 0 && (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>HS Code</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((item) => (
                    <TableRow key={item.code}>
                      <TableCell>{item.code}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => handleOpenDialog(item)} size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(item.code)} color="error" size="small">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {tabValue === 1 && (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>HS Code</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Currency</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.hsCode}</TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{item.price}</TableCell>
                      <TableCell>{item.currency}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => handleOpenDialog(item)} size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(item.id)} color="error" size="small">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {tabValue === 2 && (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>HS Code</TableCell>
                  <TableCell>Source Country</TableCell>
                  <TableCell>Destination Country</TableCell>
                  <TableCell>Rate (%)</TableCell>
                  <TableCell>Special Program</TableCell>
                  <TableCell>Last Updated</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.hsCode}</TableCell>
                      <TableCell>{item.sourceCountry}</TableCell>
                      <TableCell>{item.destinationCountry}</TableCell>
                      <TableCell>{item.rate}</TableCell>
                      <TableCell>{item.specialProgram || 'N/A'}</TableCell>
                      <TableCell>{item.dateUpdated}</TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => handleOpenDialog(item)} size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(item.id)} color="error" size="small">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {tabValue === 3 && (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Affected HS Codes</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Price Impact</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.title}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.severity}</TableCell>
                      <TableCell>{item.affectedHsCodes.join(', ')}</TableCell>
                      <TableCell>{item.isActive ? 'Active' : 'Inactive'}</TableCell>
                      <TableCell>
                        {item.expectedPriceImpact.direction === 'increase' ? '+' : '-'}
                        {item.expectedPriceImpact.percentage}%
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => handleOpenDialog(item)} size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(item.id)} color="error" size="small">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </>
    );
  };

  const renderDialogContent = () => {
    switch (tabValue) {
      case 0: // HS Codes
        return (
          <>
            <TextField
              fullWidth
              margin="normal"
              label="HS Code"
              name="code"
              value={formData.code || ''}
              onChange={handleFormChange}
              required
              disabled={currentItem !== null}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Description"
              name="description"
              value={formData.description || ''}
              onChange={handleFormChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Category"
              name="category"
              value={formData.category || ''}
              onChange={handleFormChange}
            />
          </>
        );
      
      case 1: // Price Data
        return (
          <>
            <TextField
              fullWidth
              margin="normal"
              label="HS Code"
              name="hsCode"
              value={formData.hsCode || ''}
              onChange={handleFormChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Date"
              name="date"
              type="date"
              value={formData.date || ''}
              onChange={handleFormChange}
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Price"
              name="price"
              type="number"
              value={formData.price || ''}
              onChange={handleFormChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Currency"
              name="currency"
              value={formData.currency || ''}
              onChange={handleFormChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Unit"
              name="unit"
              value={formData.unit || ''}
              onChange={handleFormChange}
              required
            />
          </>
        );
      
      case 2: // Tariff Data
        return (
          <>
            <TextField
              fullWidth
              margin="normal"
              label="HS Code"
              name="hsCode"
              value={formData.hsCode || ''}
              onChange={handleFormChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Source Country"
              name="sourceCountry"
              value={formData.sourceCountry || ''}
              onChange={handleFormChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Destination Country"
              name="destinationCountry"
              value={formData.destinationCountry || ''}
              onChange={handleFormChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Rate (%)"
              name="rate"
              type="number"
              value={formData.rate || ''}
              onChange={handleFormChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Special Program"
              name="specialProgram"
              value={formData.specialProgram || ''}
              onChange={handleFormChange}
              helperText="Leave blank if not applicable"
            />
            <TextField
              fullWidth
              margin="normal"
              label="Date Updated"
              name="dateUpdated"
              type="date"
              value={formData.dateUpdated || ''}
              onChange={handleFormChange}
              required
              InputLabelProps={{ shrink: true }}
            />
          </>
        );
      
      case 3: // Risk Data
        return (
          <>
            <TextField
              fullWidth
              margin="normal"
              label="Title"
              name="title"
              value={formData.title || ''}
              onChange={handleFormChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Description"
              name="description"
              multiline
              rows={3}
              value={formData.description || ''}
              onChange={handleFormChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Severity (1-5)"
              name="severity"
              type="number"
              InputProps={{ inputProps: { min: 1, max: 5 } }}
              value={formData.severity || 1}
              onChange={handleFormChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Affected HS Codes"
              name="affectedHsCodes"
              helperText="Comma-separated list of HS codes"
              value={Array.isArray(formData.affectedHsCodes) 
                ? formData.affectedHsCodes.join(', ') 
                : formData.affectedHsCodes || ''}
              onChange={(e) => {
                const codes = e.target.value.split(',').map(code => code.trim());
                setFormData({
                  ...formData,
                  affectedHsCodes: codes
                });
              }}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Status"
              name="isActive"
              select
              SelectProps={{ native: true }}
              value={formData.isActive ? 'true' : 'false'}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  isActive: e.target.value === 'true'
                });
              }}
              required
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </TextField>
            <TextField
              fullWidth
              margin="normal"
              label="Price Impact Direction"
              name="expectedPriceImpact.direction"
              select
              SelectProps={{ native: true }}
              value={formData.expectedPriceImpact?.direction || 'increase'}
              onChange={handleFormChange}
              required
            >
              <option value="increase">Increase</option>
              <option value="decrease">Decrease</option>
            </TextField>
            <TextField
              fullWidth
              margin="normal"
              label="Price Impact Percentage"
              name="expectedPriceImpact.percentage"
              type="number"
              value={formData.expectedPriceImpact?.percentage || 0}
              onChange={handleFormChange}
              required
            />
          </>
        );
      
      default:
        return null;
    }
  };

  const getDialogTitle = () => {
    const action = currentItem ? 'Edit' : 'Add New';
    
    switch (tabValue) {
      case 0:
        return `${action} HS Code`;
      case 1:
        return `${action} Price Data`;
      case 2:
        return `${action} Tariff Information`;
      case 3:
        return `${action} Risk Alert`;
      default:
        return 'Edit Data';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom component="div">
        Data Management
      </Typography>
      
      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="HS Codes" />
        <Tab label="Price Data" />
        <Tab label="Tariff Data" />
        <Tab label="Risk Alerts" />
      </Tabs>
      
      {renderTabContent()}
      
      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{getDialogTitle()}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            {renderDialogContent()}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {currentItem ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DataManagement;