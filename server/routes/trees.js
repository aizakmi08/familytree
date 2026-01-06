// Tree Routes - Manage saved family trees

import express from 'express';
import FamilyTree from '../models/FamilyTree.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/trees
 * Get all trees for current user
 */
router.get('/', auth, async (req, res) => {
  try {
    const trees = await FamilyTree.find({ userId: req.user.userId })
      .sort({ updatedAt: -1 });

    res.json({ trees });
  } catch (error) {
    console.error('Get trees error:', error);
    res.status(500).json({ error: 'Failed to get trees' });
  }
});

/**
 * GET /api/trees/:id
 * Get a specific tree
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const tree = await FamilyTree.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!tree) {
      return res.status(404).json({ error: 'Tree not found' });
    }

    res.json({ tree });
  } catch (error) {
    console.error('Get tree error:', error);
    res.status(500).json({ error: 'Failed to get tree' });
  }
});

/**
 * POST /api/trees
 * Create a new tree
 */
router.post('/', auth, async (req, res) => {
  try {
    const { name, theme, members, relationships } = req.body;

    const tree = new FamilyTree({
      userId: req.user.userId,
      name: name || 'My Family Tree',
      theme: theme || 'classic',
      members: (members || []).map((m) => ({
        clientId: m.id || m.clientId, // accept either shape
        name: m.name,
        photoUrl: m.photoUrl || m.photoUrl,
        birthYear: m.birthYear ?? null,
        deathYear: m.deathYear ?? null,
      })),
      relationships: (relationships || []).map((r) => ({
        from: r.from,
        to: r.to,
        type: r.type,
      })),
    });

    await tree.save();

    res.status(201).json({ tree });
  } catch (error) {
    console.error('Create tree error:', error);
    res.status(500).json({ error: 'Failed to create tree' });
  }
});

/**
 * PUT /api/trees/:id
 * Update a tree
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, theme, members, relationships } = req.body;

    const tree = await FamilyTree.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      {
        name,
        theme,
        members: (members || []).map((m) => ({
          clientId: m.id || m.clientId,
          name: m.name,
          photoUrl: m.photoUrl || m.photoUrl,
          birthYear: m.birthYear ?? null,
          deathYear: m.deathYear ?? null,
        })),
        relationships: (relationships || []).map((r) => ({
          from: r.from,
          to: r.to,
          type: r.type,
        })),
      },
      { new: true }
    );

    if (!tree) {
      return res.status(404).json({ error: 'Tree not found' });
    }

    res.json({ tree });
  } catch (error) {
    console.error('Update tree error:', error);
    res.status(500).json({ error: 'Failed to update tree' });
  }
});

/**
 * DELETE /api/trees/:id
 * Delete a tree
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const tree = await FamilyTree.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!tree) {
      return res.status(404).json({ error: 'Tree not found' });
    }

    res.json({ message: 'Tree deleted successfully' });
  } catch (error) {
    console.error('Delete tree error:', error);
    res.status(500).json({ error: 'Failed to delete tree' });
  }
});

export default router;

