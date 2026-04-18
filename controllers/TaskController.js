const Task = require('../models/task');

// Only show tasks for logged in user
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.session.userId }).sort({ createdAt: -1 });
    res.render('tasks', { tasks });
  } catch (err) {
    res.status(500).send('Error fetching tasks');
  }
};

// Save task with userId
exports.createTask = async (req, res) => {
  try {
    const task = new Task({
      title: req.body.title,
      userId: req.session.userId // tie to current user
    });
    await task.save();
    res.redirect('/tasks');
  } catch (err) {
    res.status(500).send('Error creating task');
  }
};

// Only delete your own task
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    await Task.findOneAndDelete({ _id: id, userId: req.session.userId });
    res.redirect('/tasks');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error deleting task');
  }
};

// Bonus: toggle complete
exports.toggleTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findOne({ _id: id, userId: req.session.userId });
    if (task) {
      task.completed = !task.completed;
      await task.save();
    }
    res.redirect('/tasks');
  } catch (err) {
    res.status(500).send('Error updating task');
  }
};
exports.updateTask = async (req, res) => {
  try {
    await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.session.userId },
      { title: req.body.title }
    );
    res.redirect('/tasks');
  } catch (err) {
    res.status(500).send('Error updating task');
  }
};