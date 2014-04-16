// todo these are wrong, fix these up to use the actual function def
// todo these are also really inefficient
mergeInto(LibraryManager.library, {
  b2WorldBeginContactBody: function(contactPtr) {
    b2World.BeginContactBody(contactPtr);
  },
  b2WorldEndContactBody: function(contactPtr) {
    b2World.EndContactBody(contactPtr);
  },
  b2WorldPreSolve: function(contactPtr, oldManifoldPtr) {
    b2World.PreSolve(contactPtr, oldManifoldPtr);
  },
  b2WorldPostSolve: function(contactPtr, impulsePtr) {
    b2World.PostSolve(contactPtr, impulsePtr);
  }
})