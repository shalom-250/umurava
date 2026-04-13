import { Request, Response } from 'express';
import { Model } from 'mongoose';

export const getAll = (model: Model<any>) => async (req: Request, res: Response) => {
    try {
        const items = await model.find();
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching data' });
    }
};

export const getById = (model: Model<any>) => async (req: Request, res: Response) => {
    try {
        const item = await model.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Not found' });
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching data' });
    }
};

export const create = (model: Model<any>) => async (req: Request, res: Response) => {
    try {
        const item = await model.create(req.body);
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: 'Error creating data' });
    }
};

export const update = (model: Model<any>) => async (req: Request, res: Response) => {
    try {
        const item = await model.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!item) return res.status(404).json({ message: 'Not found' });
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Error updating data' });
    }
};

export const remove = (model: Model<any>) => async (req: Request, res: Response) => {
    try {
        const item = await model.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ message: 'Not found' });
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting data' });
    }
};
