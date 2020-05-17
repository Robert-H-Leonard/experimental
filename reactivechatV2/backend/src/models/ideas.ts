
type UUID = String;

interface JWT {
  "value": String;
}

interface Session {
  id: UUID,
  token: JWT,
  active: boolean,
  expire_at: Date
}