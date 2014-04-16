#include <Box2D/Box2D.h>
void* b2Contact_GetManifold(void* contact) {
  return ((b2Contact*)contact)->GetManifold();
}
