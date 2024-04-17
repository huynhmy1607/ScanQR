import React, { useState, useEffect } from 'react';
import { BrowserQRCodeReader,ChecksumException,FormatException,NotFoundException } from '@zxing/library';
import axios from 'axios';

const Scanner = () => {
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [devices, setDevices] = useState([]);
  const [result, setResult] = useState('');
  const [codeReader] = useState(new BrowserQRCodeReader());
  
  useEffect(() => {
    codeReader.getVideoInputDevices()
      .then(videoInputDevices => {
        setSelectedDeviceId(videoInputDevices[0].deviceId);
        setDevices(videoInputDevices);
      })
      .catch(err => console.error(err));
  }, [codeReader]);
  
  const decodeOnce = () => {
    codeReader.decodeFromInputVideoDevice(selectedDeviceId, 'video')
      .then(result => {
        setResult(result.text);
        console.log(result.text);
        // callApi(result.text); // Call the API with the result
        codeReader.reset(); // Reset the code reader to stop scanning
      })
      .catch(err => setResult(err.toString())); // convert Error object to string
  };
  
  const decodeContinuously = () => {
    codeReader.decodeFromInputVideoDeviceContinuously(selectedDeviceId, 'video', (result, err) => {
      if (result) {
        setResult(result.text);
        console.log(result.text);
        // callApi(result.text); // Call the API with the result
        codeReader.reset(); // Reset the code reader to stop scanning
      }
  
      if (err) {
        setResult(err.toString()); // convert Error object to string
  
        if (err instanceof NotFoundException) {
          console.log('No QR code found.');
        }
  
        if (err instanceof ChecksumException) {
          console.log('A code was found, but its read value was not valid.');
        }
  
        if (err instanceof FormatException) {
          console.log('A code was found, but it was in an invalid format.');
        }
      }
    });
  };
  
  const callApi = async (mssv) => {
    try {
      const response = await
        axios.post('http://localhost:3000/api/data', { mssv }, {
          headers: {
            'Content-Type': 'application/json',
          }
        }
          );
      const data = response.data;
      // Handle the API response here
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };
  
  const startDecoding = (decodingStyle) => {
    if (decodingStyle === 'once') {
      decodeOnce();
    } else {
      decodeContinuously();
    }
  
    console.log(`Started decode from camera with id ${selectedDeviceId}`);
  };
  
  const reset = () => {
    codeReader.reset();
    setResult('');
    console.log('Reset.');
  };
  return (
    <div>
      <select id="sourceSelect"
        onChange={e => setSelectedDeviceId(e.target.value)}>
        {devices.map(device => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label}
          </option>
        ))}
      </select>

      <button id="startButton" onClick={() => startDecoding('once')}>
        Start Decoding
      </button>

      <button id="resetButton" onClick={reset}>
        Reset
      </button>

      <div id="result">{result}</div>
      <video id="video" style={{ width: '300px', height: '200px' }}></video>
  </div>
  );
};

export default Scanner;