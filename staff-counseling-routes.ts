// Staff Counseling API endpoints
app.get("/api/staff-counseling", async (req, res) => {
  try {
    const records = await dbStorage.getStaffCounselingRecords();
    res.json(records);
  } catch (error) {
    console.error("Error fetching staff counseling records:", error);
    res.status(500).json({ message: "Failed to fetch staff counseling records" });
  }
});

app.get("/api/staff-counseling/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid staff counseling ID" });
  }
  
  try {
    const record = await dbStorage.getStaffCounselingRecord(id);
    if (!record) {
      return res.status(404).json({ message: "Staff counseling record not found" });
    }
    res.json(record);
  } catch (error) {
    console.error("Error fetching staff counseling record:", error);
    res.status(500).json({ message: "Failed to fetch staff counseling record" });
  }
});

app.get("/api/schools/:schoolId/staff-counseling", async (req, res) => {
  const schoolId = parseInt(req.params.schoolId);
  if (isNaN(schoolId)) {
    return res.status(400).json({ message: "Invalid school ID" });
  }
  
  try {
    const records = await dbStorage.getStaffCounselingBySchool(schoolId);
    res.json(records);
  } catch (error) {
    console.error("Error fetching staff counseling records by school:", error);
    res.status(500).json({ message: "Failed to fetch staff counseling records" });
  }
});

app.get("/api/instructors/:instructorId/staff-counseling", async (req, res) => {
  const instructorId = parseInt(req.params.instructorId);
  if (isNaN(instructorId)) {
    return res.status(400).json({ message: "Invalid instructor ID" });
  }
  
  try {
    const records = await dbStorage.getStaffCounselingByInstructor(instructorId);
    res.json(records);
  } catch (error) {
    console.error("Error fetching staff counseling records by instructor:", error);
    res.status(500).json({ message: "Failed to fetch staff counseling records" });
  }
});

app.post("/api/staff-counseling", upload.single('attachment'), async (req, res) => {
  try {
    const counselingData = JSON.parse(req.body.data || '{}');
    
    // Handle file upload if present
    let attachmentUrl = null;
    if (req.file) {
      const fileName = `counseling_${Date.now()}_${req.file.originalname}`;
      const filePath = path.join(uploadDir, fileName);
      
      // Write the file to disk
      fs.writeFileSync(filePath, req.file.buffer);
      attachmentUrl = `/uploads/${fileName}`;
    }
    
    // Prepare the counseling data with file path if uploaded
    const dataToSave = {
      ...counselingData,
      attachmentUrl: attachmentUrl || counselingData.attachmentUrl || null,
      counselingDate: counselingData.counselingDate || new Date().toISOString().split('T')[0],
      createdBy: req.isAuthenticated() ? req.user.id : null
    };
    
    // Validate the data
    const validatedData = insertStaffCounselingSchema.parse(dataToSave);
    
    // Save to database
    const record = await dbStorage.createStaffCounseling(validatedData);
    
    // Log the activity
    const instructor = await dbStorage.getInstructor(record.instructorId);
    await dbStorage.createActivity({
      type: "counseling_added",
      description: `New ${record.counselingType.toLowerCase()} added for instructor "${instructor?.name || 'Unknown'}"`,
      timestamp: new Date(),
      userId: req.isAuthenticated() ? req.user.id : 1
    });
    
    res.status(201).json(record);
  } catch (error) {
    console.error("Error creating staff counseling record:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid data", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to create staff counseling record" });
  }
});

app.patch("/api/staff-counseling/:id", upload.single('attachment'), async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid staff counseling ID" });
  }
  
  try {
    // Get the existing record
    const existingRecord = await dbStorage.getStaffCounselingRecord(id);
    if (!existingRecord) {
      return res.status(404).json({ message: "Staff counseling record not found" });
    }
    
    const counselingData = JSON.parse(req.body.data || '{}');
    
    // Handle file upload if present
    let attachmentUrl = existingRecord.attachmentUrl;
    if (req.file) {
      const fileName = `counseling_${Date.now()}_${req.file.originalname}`;
      const filePath = path.join(uploadDir, fileName);
      
      // Write the file to disk
      fs.writeFileSync(filePath, req.file.buffer);
      attachmentUrl = `/uploads/${fileName}`;
    }
    
    // Prepare the update data
    const dataToUpdate = {
      ...counselingData,
      attachmentUrl: counselingData.attachmentUrl !== undefined ? counselingData.attachmentUrl : attachmentUrl
    };
    
    // Validate the data
    const validatedData = insertStaffCounselingSchema.partial().parse(dataToUpdate);
    
    // Update the record
    const updatedRecord = await dbStorage.updateStaffCounseling(id, validatedData);
    
    // Log the activity
    const instructor = await dbStorage.getInstructor(existingRecord.instructorId);
    await dbStorage.createActivity({
      type: "counseling_updated",
      description: `${existingRecord.counselingType} for instructor "${instructor?.name || 'Unknown'}" updated`,
      timestamp: new Date(),
      userId: req.isAuthenticated() ? req.user.id : 1
    });
    
    res.json(updatedRecord);
  } catch (error) {
    console.error("Error updating staff counseling record:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid data", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to update staff counseling record" });
  }
});

app.delete("/api/staff-counseling/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid staff counseling ID" });
  }
  
  try {
    // Get the record before deleting for the activity log
    const record = await dbStorage.getStaffCounselingRecord(id);
    if (!record) {
      return res.status(404).json({ message: "Staff counseling record not found" });
    }
    
    // Delete the record
    await dbStorage.deleteStaffCounseling(id);
    
    // Log the activity
    const instructor = await dbStorage.getInstructor(record.instructorId);
    await dbStorage.createActivity({
      type: "counseling_deleted",
      description: `${record.counselingType} for instructor "${instructor?.name || 'Unknown'}" deleted`,
      timestamp: new Date(),
      userId: req.isAuthenticated() ? req.user.id : 1
    });
    
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting staff counseling record:", error);
    res.status(500).json({ message: "Failed to delete staff counseling record" });
  }
});