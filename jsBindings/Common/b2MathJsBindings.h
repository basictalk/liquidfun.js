#ifndef B2MATHJSBINDINGS_H
#define B2MATHJSBINDINGS_H
#include <emscripten/bind.h>
#include <Box2D/Box2D.h>

using namespace emscripten;

EMSCRIPTEN_BINDINGS(b2Math) {
  class_<b2Vec2>("b2Vec2")
      .constructor<>()
      .constructor<float32, float32>()
      .function("SetZero", &b2Vec2::SetZero)
      .function("Set", &b2Vec2::Set)
      .property("x", &b2Vec2::x)
      .property("y", &b2Vec2::y);

}
#endif
