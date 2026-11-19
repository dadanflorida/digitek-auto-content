export default function handler(req, res) {
return res.status(200).json({
success: true,
message: "DIGITEK AUTO CONTENT ENGINE API BERHASIL",
server: "Vercel",
module: "Research API",
timestamp: new Date().toISOString()
});
}
