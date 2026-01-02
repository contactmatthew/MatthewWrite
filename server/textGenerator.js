// Meaningful words and sentences for typing practice

const commonWords = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
  'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
  'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
  'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
  'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us'
];

const meaningfulSentences = [
  'The quick brown fox jumps over the lazy dog.',
  'Programming is the art of telling another human being what a computer should do.',
  'The best way to predict the future is to invent it.',
  'Code is like humor. When you have to explain it, it is bad.',
  'First, solve the problem. Then, write the code.',
  'Experience is the name everyone gives to their mistakes.',
  'In order to be irreplaceable, one must always be different.',
  'Java is to JavaScript what car is to carpet.',
  'Sometimes it pays to stay in bed on Monday, rather than spending the rest of the week debugging Monday\'s code.',
  'Perfection is achieved not when there is nothing more to add, but rather when there is nothing more to take away.',
  'Simplicity is the ultimate sophistication.',
  'Before software can be reusable it first has to be usable.',
  'The best method for accelerating a computer is the one that boosts it by 9.8 m/s2.',
  'I think Microsoft named .Net so it wouldn\'t show up in a Unix directory listing.',
  'There are two ways to write error-free programs; only the third one works.',
  'A good programmer is someone who looks both ways before crossing a one-way street.',
  'The computer was born to solve problems that did not exist before.',
  'Walking on water and developing software from a specification are easy if both are frozen.',
  'The most disastrous thing that you can ever learn is your first programming language.',
  'The best thing about a boolean is even if you are wrong, you are only off by a bit.',
  'Software and cathedrals are much the same; first we build them, then we pray.',
  'Always code as if the person who ends up maintaining your code is a violent psychopath who knows where you live.',
  'Measuring programming progress by lines of code is like measuring aircraft building progress by weight.',
  'Debugging is twice as hard as writing the code in the first place.',
  'If debugging is the process of removing software bugs, then programming must be the process of putting them in.',
  'It\'s not a bug, it\'s an undocumented feature.',
  'The best code is no code at all.',
  'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.',
  'Programs must be written for people to read, and only incidentally for machines to execute.',
  'Give a man a program, frustrate him for a day. Teach a man to program, frustrate him for a lifetime.'
];

const meaningfulWords = [
  'computer', 'programming', 'software', 'algorithm', 'function', 'variable', 'constant',
  'database', 'server', 'client', 'network', 'internet', 'website', 'application',
  'development', 'coding', 'debugging', 'testing', 'deployment', 'framework', 'library',
  'language', 'syntax', 'semantic', 'compiler', 'interpreter', 'execution', 'runtime',
  'memory', 'storage', 'processor', 'hardware', 'interface', 'design', 'architecture',
  'security', 'encryption', 'authentication', 'authorization', 'session', 'cookie',
  'request', 'response', 'protocol', 'http', 'https', 'api', 'rest', 'json', 'xml',
  'html', 'css', 'javascript', 'python', 'java', 'csharp', 'php', 'ruby', 'go',
  'react', 'angular', 'vue', 'node', 'express', 'mongodb', 'mysql', 'postgresql',
  'git', 'github', 'version', 'control', 'repository', 'commit', 'branch', 'merge',
  'agile', 'scrum', 'sprint', 'backlog', 'user', 'story', 'requirement', 'specification',
  'documentation', 'comment', 'readme', 'license', 'open', 'source', 'contribution',
  'maintain', 'refactor', 'optimize', 'performance', 'scalability', 'reliability',
  'quality', 'standard', 'best', 'practice', 'pattern', 'principle', 'methodology',
  'team', 'collaboration', 'communication', 'meeting', 'discussion', 'review', 'feedback'
];

function generateRandomWords(count) {
  const words = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * meaningfulWords.length);
    words.push(meaningfulWords[randomIndex]);
  }
  return words.join(' ');
}

function generateRandomSentences(count) {
  const sentences = [];
  const usedIndices = new Set();
  
  for (let i = 0; i < count; i++) {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * meaningfulSentences.length);
    } while (usedIndices.has(randomIndex) && usedIndices.size < meaningfulSentences.length);
    
    usedIndices.add(randomIndex);
    sentences.push(meaningfulSentences[randomIndex]);
    
    if (usedIndices.size >= meaningfulSentences.length) {
      usedIndices.clear();
    }
  }
  
  return sentences.join(' ');
}

function generateMixedText(count) {
  const words = [];
  const totalWords = count;
  let sentenceCount = 0;
  
  for (let i = 0; i < totalWords; i++) {
    if (Math.random() < 0.3 && sentenceCount < meaningfulSentences.length) {
      // Add a sentence
      const randomSentence = meaningfulSentences[Math.floor(Math.random() * meaningfulSentences.length)];
      words.push(randomSentence);
      sentenceCount++;
    } else {
      // Add a meaningful word
      const randomWord = meaningfulWords[Math.floor(Math.random() * meaningfulWords.length)];
      words.push(randomWord);
    }
  }
  
  return words.join(' ');
}

module.exports = {
  generateText: (type, length) => {
    switch (type) {
      case 'words':
        return generateRandomWords(length);
      case 'sentences':
        return generateRandomSentences(Math.ceil(length / 10));
      case 'mixed':
        return generateMixedText(length);
      default:
        return generateRandomWords(length);
    }
  }
};

