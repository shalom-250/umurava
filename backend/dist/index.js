"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const db_1 = __importDefault(require("./config/db"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const job_routes_1 = __importDefault(require("./routes/job.routes"));
const candidate_routes_1 = __importDefault(require("./routes/candidate.routes"));
const screening_routes_1 = __importDefault(require("./routes/screening.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const comparison_routes_1 = __importDefault(require("./routes/comparison.routes"));
const swagger_1 = require("./config/swagger");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Swagger Documentation
(0, swagger_1.setupSwagger)(app);
// Connect to Database
(0, db_1.default)();
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('dev'));
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/jobs', job_routes_1.default);
app.use('/api/candidates', candidate_routes_1.default);
app.use('/api/screening', screening_routes_1.default);
app.use('/api/analytics', analytics_routes_1.default);
app.use('/api/comparison', comparison_routes_1.default);
// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'Umurava Screening AI API is running' });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
