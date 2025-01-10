/*
  # Create quotes management tables

  1. New Tables
    - `quotes`
      - `id` (uuid, primary key)
      - `number` (bigint, auto-incremented quote number)
      - `client_name` (text, client's name)
      - `client_document` (text, CPF/CNPJ)
      - `service_description` (text)
      - `observations` (text)
      - `value` (numeric, quote value)
      - `payment_method` (text)
      - `status` (text, quote status)
      - `created_at` (timestamp)
      - `user_id` (uuid, references auth.users)

  2. Security
    - Enable RLS on `quotes` table
    - Add policies for CRUD operations
*/

CREATE SEQUENCE IF NOT EXISTS quote_number_seq;

CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number bigint DEFAULT nextval('quote_number_seq'),
  client_name text NOT NULL,
  client_document text NOT NULL,
  service_description text NOT NULL,
  observations text,
  value numeric(10,2) NOT NULL,
  payment_method text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users NOT NULL
);

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own quotes"
  ON quotes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quotes"
  ON quotes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quotes"
  ON quotes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);