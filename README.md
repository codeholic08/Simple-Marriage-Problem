# Stable Marriage Problem Demo

An interactive web application demonstrating the **Gale-Shapley algorithm** for solving the Stable Marriage Problem, featuring a modern UI inspired by [Mollie's](https://www.mollie.com/) design and an intelligent conflict resolution assistant.

![Live Demo](https://img.shields.io/badge/Demo-Live%20on%20GitHub%20Pages-green)
![License](https://img.shields.io/badge/license-MIT-blue)
![No Build Required](https://img.shields.io/badge/build-none-brightgreen)
![Deployment](https://github.com/codeholic08/Simple-Marriage-Problem/actions/workflows/deploy.yml/badge.svg)

## 🎯 Features

### ✨ **Interactive Algorithm Visualization**
- **Drag & Drop Interface**: Reorder preferences with smooth, interactive animations
- **Real-time Solving**: Run the Gale-Shapley algorithm with instant results
- **Visual Feedback**: Enhanced drag interactions with gradient effects and scaling
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### 🧠 **Intelligent Analysis**
- **Conflict Resolution Assistant**: Rule-based AI that explains matching outcomes
- **Stability Metrics**: Comprehensive scoring including blocking pairs and satisfaction rates
- **What-If Suggestions**: Get actionable recommendations to improve matchings
- **Educational Insights**: Learn why certain matches occur and how to optimize them

### 🎨 **Modern Design**
- **Dark Mode Default**: Professional dark theme inspired by modern design patterns
- **Light/Dark Toggle**: Switch themes with persistent preference storage
- **Mollie-Inspired UI**: Clean typography, rounded buttons, and smooth animations
- **Interactive Elements**: Hover effects, shadows, and micro-interactions

### 📊 **Comprehensive Metrics**
- **Stability Score**: Measures the quality of the matching (1 - blocking_pairs/total_pairs)
- **Average Happiness**: Mean satisfaction across all participants
- **Proposer vs Receiver Analysis**: Compares satisfaction between both groups
- **Blocking Pairs Detection**: Identifies and explains unstable pairs

## 🚀 Quick Start

### **🌐 Option 1: Live Demo (Recommended)**
**[👉 Try it now on GitHub Pages](https://codeholic08.github.io/Simple-Marriage-Problem/)**

### **💻 Option 2: Run Locally**
No build required! Simply download and open.

```bash
# Clone the repository
git clone https://github.com/codeholic08/Simple-Marriage-Problem.git

# Navigate to the directory
cd Simple-Marriage-Problem

# Start a local server (recommended for ES modules)
python -m http.server 8000

# Open in browser
# Visit http://localhost:8000
```

### **📁 Option 3: Direct File Access**
You can also simply open `index.html` directly in any modern browser, though a local server is recommended for optimal ES module loading.

## 📁 Project Structure

```
Simple-Marriage-Problem/
├── index.html          # Main HTML file with UI structure
├── styles.css          # Modern CSS with dark/light themes
├── smp.js              # Gale-Shapley algorithm implementation
├── app.js              # UI interactions and conflict resolution
└── README.md           # This file
```

## 🎮 How to Use

### **1. Set Up Preferences**
- Adjust the number of participants (3-10 per side)
- Drag and drop items within each participant's preference list
- Rankings update automatically as you reorder

### **2. Run the Algorithm**
- Click **"Run Gale-Shapley"** to find the stable matching
- View results in the comprehensive dashboard
- Analyze metrics and blocking pairs

### **3. Get Intelligent Suggestions**
- Review the **Conflict Resolution Assistant** analysis
- Click **"What-If: Try Suggested Change"** to apply recommendations
- Compare before/after metrics to see improvements

### **4. Experiment & Learn**
- Try different preference configurations
- Toggle between light/dark modes
- Use the reset button to start fresh

## 🔬 Algorithm Details

### **Gale-Shapley Algorithm**
The implementation uses the classic **male-optimal** version where:
- Group A (proposers) make offers to their preferred partners
- Group B (receivers) accept the best available offer
- The algorithm guarantees a stable matching in O(n²) time

### **Stability Analysis**
A matching is **stable** if there are no blocking pairs - couples who would prefer each other over their current partners.

### **Metrics Calculation**
- **Stability Score**: `1 - (blocking_pairs / total_possible_pairs)`
- **Happiness**: Based on partner ranking (lower rank = higher happiness)
- **Satisfaction**: Normalized happiness score (higher is better)

## 🎨 Design Philosophy

### **Inspired by Modern Finance UI**
The design takes inspiration from [Mollie's](https://www.mollie.com/) clean and professional aesthetic:
- **Inter font** for crisp typography
- **Rounded buttons** with subtle shadows
- **Smooth animations** using CSS cubic-bezier functions
- **Gradient accents** and interactive hover states

### **Accessibility First**
- **Keyboard navigation** support for all interactive elements
- **Screen reader friendly** with proper ARIA labels
- **High contrast** color schemes in both themes
- **Reduced motion** support for users with vestibular disorders

## 🛠️ Technical Implementation

### **Pure JavaScript & ES Modules**
- No frameworks or build tools required
- Modern ES6+ features with module imports
- Efficient DOM manipulation and event handling

### **Advanced Drag & Drop**
- Custom drag images with visual transformations
- Smooth animations during drag operations
- Intelligent drop zone highlighting
- Mouse offset tracking for natural movement

### **State Management**
- Centralized application state
- Immutable preference updates
- Theme persistence with localStorage

## 📚 Educational Value

This demo is perfect for:
- **Computer Science students** learning about matching algorithms
- **Game theory enthusiasts** exploring market design
- **Algorithm visualization** and interactive learning
- **UI/UX designers** studying modern web interactions

## 🤝 Contributing

Contributions are welcome! Areas for improvement:
- Additional algorithm variants (female-optimal, random tie-breaking)
- More sophisticated conflict resolution strategies
- Enhanced visualizations (network graphs, animation sequences)
- Accessibility improvements
- Mobile-specific optimizations

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Gale & Shapley** for the original algorithm (1962)
- **[Mollie](https://www.mollie.com/)** for design inspiration
- **Mohammad Maaz Rashid** for the dark theme color palette inspiration

---

**Made with ❤️ for education and exploration of algorithmic problem solving.**

### 🌐 Live Demo
**🔗 [Try the Live Demo](https://codeholic08.github.io/Simple-Marriage-Problem/)**

The demo is automatically deployed to GitHub Pages. You can also run it locally by downloading the files - no installation required!