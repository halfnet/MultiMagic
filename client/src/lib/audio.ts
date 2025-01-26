// Audio helper functions for game sounds
let audioContext: AudioContext | null = null;

// Short beep sounds for different events
const CORRECT_SOUND = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiDNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2JQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTfjMGHm7A7+WSRA0PVqzn77BdGAg+ltryxnMpBSl+zPLaizsIGGS57OihUBELTKXh8bllHgU2jdXzzn0vBSF1xe/glEILElyx6OyrWBUIQ5zd8sFuJAUuhM/z1YE2Bhxqvu7olEYODlOq5O+zYBoIO5PY88p2KwUme8rx3I4+CRZiturqpVITC0mi4PK8aB8GM4nU8tGAMQYfcsLu45ZFDBFYr+ftrVoXCECY3PLEcSYELIHO8diDOQcZaLvt559NEAxPqOPwtmMcBjiP1/PMeS0GI3fH8N2IQAoUXrTp66hVFApGnt/yvmwhBTCG0fPTfjQGHW/A7eSRRA0PVqzm77BeGQc+ltrzxnUoBSh+zPDaizsIGGS56+mjTxELTKXh8bllHgU1jdT0z3wvBSJ0xe/glEILElyx6OyrWRUIRJve8sFuJAUug8/z1YE2Bhxqvu7olEYODlOq5O+zYRoHO5PY88p3KwUme8rx3I4+CRVht+rqpVMSC0mi4PG9aB8GMojU8tGAMQYfccPu45ZFDBFYr+ftrVwWCECY3PLEcSYGK4DN8tiDOQcZZ7vs559NEAxPqOPxtmQcBjiP1/PMeywGI3fH8N+IQAoUXrTp66hWEwlGnt/yv2wiBDCG0fPTfjQHHG/A7eSRRQ0PVqzm77BeGQc9ltvyxnUoBSh9y/HajDsIF2W56+mjUREKTKPh8blnHgU1jdTy0HwvBSF0xPDglEILElux6eyrWRUJQ5vd88FwJAQug8/z1YE3Bhxqvu7olUYODlKp5e+zYRoHO5LZ88p3KwUmecnx3Y4/CBVhtuvqpVMSC0mh4fG9aiAFM4jU8tGAMQYfccLv45ZGCxFYr+ftrVwXB0CY3PLEcycFKoDN8tiEOQcZZ7vs559OEAxPp+PxtmQdBTiP1/PMey0FI3bH8d+IQQkUXbPq66hWEwlGnt/yv2wiBDCG0PPTgDQHHG3A7eSRRQ0PVKzn77BeGQc9ltrzxnUoBSh9y/HajDwIF2S56+mjUREKTKPh8blnHwU1jdTy0H4vBSF0xPDglEILElux6eyrWRUJQ5vd88FwJAUtg8/z1YI3Bhxqvu7olUYODlKp5e+zYhoGOpPX88p3LAUlecnx3Y8+CBZhtuvqpVMSC0mh4PK+aiAFMofU89GAMgUfccLv45ZGDRBYr+ftrVwXB0CY3PLEcycFKoDN8tiEOQcZZ7vs559OEAxPp+PxtmQdBTeP1/PMey0FI3bH8d+IQQsT';

// Simple low tone for incorrect answer
const INCORRECT_SOUND = 'data:audio/wav;base64,UklGRnYEAABXQVZFZmt0IBAAAAABAAEARKwAAIhYAQACABAAZGF0YVIAAAB/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/';

// Celebratory sound for game completion
const COMPLETE_SOUND = 'data:audio/wav;base64,UklGRqYGAABXQVZFZmt0IBAAAAABAAEARKwAAIhYAQACABAAZGF0YYIGAAAAAAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn+AgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/wABAgMEBQYHCAkKCwwNDg8QERITFBUWFxgZGhscHR4fICEiIyQlJicoKSorLC0uLzAxMjM0NTY3ODk6Ozw9Pj9AQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVpbXF1eX2BhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ent8fX5/gIGCg4SFhoeIiYqLjI2Oj5CRkpOUlZaXmJmam5ydnp+goaKjpKWmp6ipqqusra6vsLGys7S1tre4ubq7vL2+v8DBwsPExcbHyMnKy8zNzs/Q0dLT1NXW19jZ2tvc3d7f4OHi4+Tl5ufo6err7O3u7/Dx8vP09fb3+Pn6+/z9/v8AAQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHB0eHyAhIiMkJSYnKCkqKywtLi8wMTIzNDU2Nzg5Ojs8PT4/QEFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaW1xdXl9gYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXp7fH1+f4CBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6SlpqeoqaqrrK2ur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfY2drb3N3e3+Dh4uPk5ebn6Onq6+zt7u/w8fLz9PX29/j5+vv8/f7/';

// Initialize AudioContext
const initAudioContext = () => {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
};

// Function to play a sound from a data URL
const playSound = async (dataUrl: string) => {
  try {
    const context = initAudioContext();
    const response = await fetch(dataUrl);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await context.decodeAudioData(arrayBuffer);
    const source = context.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(context.destination);
    source.start(0);
  } catch (error) {
    console.error('Failed to play sound:', error);
  }
};

// Sound effect functions with unique sounds for each event
export const playCorrectSound = () => playSound(CORRECT_SOUND); // High-pitched "ding" for correct answers
export const playIncorrectSound = () => playSound(INCORRECT_SOUND); // Gentle low tone for incorrect answers
export const playCompleteSound = () => playSound(COMPLETE_SOUND); // Celebratory fanfare for game completion