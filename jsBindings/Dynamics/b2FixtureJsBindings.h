#ifndef B2FIXTUREJSBINDINGS_H
#define B2FIXTUREJSBINDINGS_H
#include <emscripten/bind.h>
#include <Box2D/Box2D.h>

using namespace emscripten;

const b2Shape* GetShape(b2FixtureDef& f) {
  return f.shape;
}

void SetShape(b2FixtureDef& f, b2Shape* shape) {
  f.shape = shape;
}

EMSCRIPTEN_BINDINGS(b2Fixture) {
  class_<b2FixtureDef>("b2FixtureDef")
      .constructor<>()
      .function("GetShape", &GetShape, allow_raw_pointers())
      .function("SetShape", &SetShape, allow_raw_pointers())
      .property("friction", &b2FixtureDef::friction)
      .property("restitution", &b2FixtureDef::restitution)
      .property("density", &b2FixtureDef::density);

  class_<b2Fixture>("b2Fixture");
}

#endif
