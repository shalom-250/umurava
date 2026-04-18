"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.create = exports.getById = exports.getAll = void 0;
const getAll = (model) => async (req, res) => {
    try {
        const items = await model.find();
        res.json(items);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching data' });
    }
};
exports.getAll = getAll;
const getById = (model) => async (req, res) => {
    try {
        const item = await model.findById(req.params.id);
        if (!item)
            return res.status(404).json({ message: 'Not found' });
        res.json(item);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching data' });
    }
};
exports.getById = getById;
const create = (model) => async (req, res) => {
    try {
        const item = await model.create(req.body);
        res.status(201).json(item);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating data' });
    }
};
exports.create = create;
const update = (model) => async (req, res) => {
    try {
        const item = await model.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!item)
            return res.status(404).json({ message: 'Not found' });
        res.json(item);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating data' });
    }
};
exports.update = update;
const remove = (model) => async (req, res) => {
    try {
        const item = await model.findByIdAndDelete(req.params.id);
        if (!item)
            return res.status(404).json({ message: 'Not found' });
        res.json({ message: 'Deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting data' });
    }
};
exports.remove = remove;
