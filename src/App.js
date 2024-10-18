import React, { useState } from "react";
import { Container, Button, TextField, MenuItem, CircularProgress } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { saveAs } from "file-saver";

const App = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [parameter, setParameter] = useState("");
  const [parameterValue, setParameterValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [pageSize, setPageSize] = useState(5);

  const parameters = [
    { value: "phone", label: "Phone Number" },
    { value: "voicemail", label: "Voicemail" },
    { value: "user_id", label: "User ID" },
    { value: "cluster_id", label: "Cluster ID" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !parameter || !parameterValue) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const response = await axios.get("http://127.0.0.1:8000/records/file/", {
        params: {
          start_date: startDate,
          end_date: endDate,
          [parameter]: parameterValue,
        },
      });

      setRows(response.data.results);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    const csvRows = [
      ["_id", "originationTime", "clusterId", "userId", "phone", "voicemail"],
      ...rows.map((row) => [
        row._id,
        row.originationTime,
        row.clusterId,
        row.userId,
        row.devices.phone,
        row.devices.voicemail,
      ]),
    ];

    const csvContent = csvRows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "records.csv");
  };

  return (
    <Container>
      <h1>Data Retrieval Form</h1>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Start Date (YYYY-MM-DD)"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="End Date (YYYY-MM-DD)"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          select
          label="Parameter"
          value={parameter}
          onChange={(e) => setParameter(e.target.value)}
          required
          fullWidth
          margin="normal"
        >
          {parameters.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Parameter Value"
          value={parameterValue}
          onChange={(e) => setParameterValue(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary" style={{ marginTop: 20 }}>
          Submit
        </Button>
      </form>

      {loading && <CircularProgress />}

      {rows.length > 0 && (
        <>
          <div style={{ height: 400, width: "100%", marginTop: 20 }}>
            <DataGrid
              rows={rows}
              getRowId={(row) => row._id}
              columns={[
                { field: "_id", headerName: "ID", width: 90 },
                { field: "originationTime", headerName: "Origination Time", width: 200 },
                { field: "clusterId", headerName: "Cluster ID", width: 150 },
                { field: "userId", headerName: "User ID", width: 150 },
                { field: "phone", headerName: "Phone", width: 150 },
                { field: "voicemail", headerName: "Voicemail", width: 150 },
              ]}
              pageSize={pageSize}
              onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
              rowsPerPageOptions={[5, 10, 20]}
              pagination
              sortingOrder={["asc", "desc"]}
            />
          </div>
          <Button variant="contained" color="secondary" onClick={handleDownloadCSV} style={{ marginTop: 20 }}>
            Download CSV
          </Button>
        </>
      )}
    </Container>
  );
};

export default App;
