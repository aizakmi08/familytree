import express from 'express';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import FamilyTree from '../models/FamilyTree.js';
import Person from '../models/Person.js';
import Relationship from '../models/Relationship.js';

const router = express.Router();

// Get all trees for user
router.get('/', authenticate, async (req, res) => {
  try {
    const trees = await FamilyTree.find({ userId: req.userId }).populate('people relationships');
    res.json(trees);
  } catch (error) {
    console.error('Get trees error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single tree
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const tree = await FamilyTree.findById(req.params.id)
      .populate('people relationships');

    if (!tree) {
      return res.status(404).json({ message: 'Tree not found' });
    }

    // Check if tree is public or belongs to user
    if (!tree.isPublic && tree.userId?.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(tree);
  } catch (error) {
    console.error('Get tree error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or update tree
router.post('/', authenticate, async (req, res) => {
  try {
    const { id, name, theme, people, relationships } = req.body;

    // Find existing tree or create new
    let tree = await FamilyTree.findOne({ _id: id, userId: req.userId });

    if (tree) {
      // Update existing tree
      tree.name = name || tree.name;
      tree.theme = theme || tree.theme;

      // Update people
      const personIds = [];
      for (const personData of people || []) {
        let person;
        if (personData.id && personData.id.startsWith('person_')) {
          // New person from local storage
          person = new Person({
            name: personData.name,
            photo: personData.photo,
            birthDate: personData.birthDate,
            deathDate: personData.deathDate,
            bio: personData.bio,
            position: personData.position,
          });
          await person.save();
        } else {
          // Existing person
          person = await Person.findById(personData.id);
          if (person) {
            Object.assign(person, personData);
            await person.save();
          }
        }
        if (person) personIds.push(person._id);
      }

      // Update relationships
      const relationshipIds = [];
      for (const relData of relationships || []) {
        // Map local person IDs to database IDs
        // This is simplified - in production, you'd need a mapping
        const relationship = new Relationship({
          from: relData.from,
          to: relData.to,
          type: relData.type,
        });
        await relationship.save();
        relationshipIds.push(relationship._id);
      }

      tree.people = personIds;
      tree.relationships = relationshipIds;
      await tree.save();

      res.json(tree);
    } else {
      // Create new tree
      const personIds = [];
      for (const personData of people || []) {
        const person = new Person(personData);
        await person.save();
        personIds.push(person._id);
      }

      const relationshipIds = [];
      for (const relData of relationships || []) {
        const relationship = new Relationship(relData);
        await relationship.save();
        relationshipIds.push(relationship._id);
      }

      tree = new FamilyTree({
        name: name || 'My Family Tree',
        userId: req.userId,
        theme: theme || 'classic',
        people: personIds,
        relationships: relationshipIds,
      });

      await tree.save();
      res.status(201).json(tree);
    }
  } catch (error) {
    console.error('Save tree error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete tree
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const tree = await FamilyTree.findOne({ _id: req.params.id, userId: req.userId });
    if (!tree) {
      return res.status(404).json({ message: 'Tree not found' });
    }

    // Delete associated people and relationships
    await Person.deleteMany({ _id: { $in: tree.people } });
    await Relationship.deleteMany({ _id: { $in: tree.relationships } });
    await tree.deleteOne();

    res.json({ message: 'Tree deleted' });
  } catch (error) {
    console.error('Delete tree error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

