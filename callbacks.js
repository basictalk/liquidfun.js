/**
 * Created by joshualitt on 4/13/14.
 */
mergeInto(LibraryManager.library, {
  b2WorldBeginContact: function(fixA, fixB) {
    b2WorldBeginContact(fixA, fixB);
  },
  b2WorldEndContact: function(fixA, fixB) {
    b2WorldEndContact(fixA, fixB);
  }
})