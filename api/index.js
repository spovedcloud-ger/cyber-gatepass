export default function handler(req, res) {
  res.status(200).json({ 
    message: "SYSTEM_ONLINE_CORE", 
    time: new Date().toISOString() 
  });
}
