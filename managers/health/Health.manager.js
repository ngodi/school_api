class HealthManager {
  static handle(req, res) {
    res.status(200).json({ status: "ok" });
  }
}

export default HealthManager;
