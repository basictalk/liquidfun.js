#ifndef B2SHAPEJSBINDINGS_H
#define B2SHAPEJSBINDINGS_H
#include <emscripten/bind.h>
#include <Box2D/Box2D.h>

using namespace emscripten;

EMSCRIPTEN_BINDINGS(b2Shape) {
  class_<b2Shape>("b2Shape");
}

#endif
