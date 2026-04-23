-- OBD-II Integration Schema
-- Tables for vehicle Bluetooth connections, real-time OBD data, diagnostic codes, and alerts

-- 1. OBD Connections - Track Bluetooth device connections
CREATE TABLE IF NOT EXISTS obd_connections (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id TEXT NOT NULL,
  device_name TEXT NOT NULL,
  device_address TEXT NOT NULL,
  connection_status TEXT CHECK (connection_status IN ('connected', 'disconnected', 'failed')) DEFAULT 'disconnected',
  last_connected_at TIMESTAMP WITH TIME ZONE,
  connection_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. OBD Vehicle Data - Store real-time and historical OBD data
CREATE TABLE IF NOT EXISTS obd_vehicle_data (
  id SERIAL PRIMARY KEY,
  obd_connection_id INT NOT NULL REFERENCES obd_connections(id) ON DELETE CASCADE,
  rpm INT,
  speed INT,
  engine_temp DECIMAL(5, 2),
  fuel_level INT,
  fuel_pressure DECIMAL(5, 2),
  intake_temp DECIMAL(5, 2),
  throttle_position INT,
  intake_air_temp DECIMAL(5, 2),
  fuel_consumption DECIMAL(6, 2),
  o2_sensors JSONB,
  calculated_load DECIMAL(5, 2),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. OBD Error Codes (DTC) - Lookup table with descriptions
CREATE TABLE IF NOT EXISTS obd_error_codes (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('info', 'warning', 'critical')) DEFAULT 'warning',
  resolution TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. OBD Alerts - Real-time alerts triggered by vehicle parameters
CREATE TABLE IF NOT EXISTS obd_alerts (
  id SERIAL PRIMARY KEY,
  obd_connection_id INT NOT NULL REFERENCES obd_connections(id) ON DELETE CASCADE,
  alert_type TEXT CHECK (alert_type IN ('dtc', 'temperature', 'fuel', 'rpm', 'speed', 'custom')) DEFAULT 'custom',
  severity TEXT CHECK (severity IN ('info', 'warning', 'critical')) DEFAULT 'warning',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  code TEXT,
  parameter TEXT,
  value DECIMAL(10, 2),
  threshold DECIMAL(10, 2),
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. OBD Alert History - Track dismissed/acknowledged alerts
CREATE TABLE IF NOT EXISTS obd_alert_history (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_id INT NOT NULL REFERENCES obd_alerts(id) ON DELETE CASCADE,
  action TEXT CHECK (action IN ('viewed', 'dismissed', 'acknowledged')) DEFAULT 'viewed',
  action_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_obd_connections_user_id ON obd_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_obd_connections_vehicle_id ON obd_connections(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_obd_vehicle_data_connection_id ON obd_vehicle_data(obd_connection_id);
CREATE INDEX IF NOT EXISTS idx_obd_vehicle_data_timestamp ON obd_vehicle_data(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_obd_alerts_connection_id ON obd_alerts(obd_connection_id);
CREATE INDEX IF NOT EXISTS idx_obd_alerts_created_at ON obd_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_obd_alert_history_user_id ON obd_alert_history(user_id);

-- Enable Row Level Security (RLS) for security
ALTER TABLE obd_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE obd_vehicle_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE obd_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE obd_alert_history ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own connections
CREATE POLICY obd_connections_user_policy ON obd_connections
  USING (auth.uid() = user_id);

-- RLS Policy: Users can only see vehicle data for their connections
CREATE POLICY obd_vehicle_data_user_policy ON obd_vehicle_data
  FOR SELECT USING (
    obd_connection_id IN (
      SELECT id FROM obd_connections WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Users can only see alerts for their connections
CREATE POLICY obd_alerts_user_policy ON obd_alerts
  FOR SELECT USING (
    obd_connection_id IN (
      SELECT id FROM obd_connections WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Users can only see their own alert history
CREATE POLICY obd_alert_history_user_policy ON obd_alert_history
  USING (auth.uid() = user_id);