const Location = require('../models/Location');

// Get all locations
const getLocations = async (req, res) => {
  try {
    const locations = await Location.find().sort({ name: 1 });
    
    res.json({
      success: true,
      data: locations
    });
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch locations'
    });
  }
};

// Get single location
const getLocation = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    
    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    res.json({
      success: true,
      data: location
    });
  } catch (error) {
    console.error('Get location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch location'
    });
  }
};

// Create new location
const createLocation = async (req, res) => {
  try {
    const { name, city, address, latitude, longitude } = req.body;

    const location = new Location({
      name,
      city,
      address,
      latitude,
      longitude
    });

    await location.save();

    res.status(201).json({
      success: true,
      message: 'Location created successfully',
      data: location
    });
  } catch (error) {
    console.error('Create location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create location'
    });
  }
};

// Update location
const updateLocation = async (req, res) => {
  try {
    const { name, city, address, latitude, longitude } = req.body;
    
    const location = await Location.findByIdAndUpdate(
      req.params.id,
      { name, city, address, latitude, longitude },
      { new: true, runValidators: true }
    );

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    res.json({
      success: true,
      message: 'Location updated successfully',
      data: location
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update location'
    });
  }
};

// Delete location
const deleteLocation = async (req, res) => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    res.json({
      success: true,
      message: 'Location deleted successfully',
      data: location
    });
  } catch (error) {
    console.error('Delete location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete location'
    });
  }
};

module.exports = {
  getLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation
};
