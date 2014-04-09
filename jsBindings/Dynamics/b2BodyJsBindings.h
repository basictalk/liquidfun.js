#ifndef B2BODYJSBINDINGS_H
#define B2BODYJSBINDINGS_H
#include <emscripten/bind.h>
#include <Box2D/Box2D.h>

using namespace emscripten;

namespace b2BodyJs {
  void CreateFixture(b2Body& body, const b2Shape* shape, float32 d) {
    body.CreateFixture(shape, d);
  }

  b2Vec2* position(b2BodyDef& def) {
    return &def.position;
  }

}
EMSCRIPTEN_BINDINGS(b2Body) {

  class_<b2BodyDef>("b2BodyDef")
      .constructor<>()
      .property("type", &b2BodyDef::type)
      .function("position", &b2BodyJs::position, allow_raw_pointer<ret_val>());

  class_<b2Body>("b2Body")
      .function("CreateFixture",
                select_overload<b2Fixture*(const b2FixtureDef*)>(&b2Body::CreateFixture),
                 allow_raw_pointers())
                //select_overload<b2Fixture*(const b2FixtureDef*)>(&b2Body::CreateFixture),
                //&b2BodyJs::CreateFixture,
                //allow_raw_pointer<arg<0>>())
      .function("CreateFixture_s",
                select_overload<b2Fixture*(const b2Shape*, float32)>(&b2Body::CreateFixture),
                allow_raw_pointers())
      .function("GetPosition", &b2Body::GetPosition)
      .function("GetAngle", &b2Body::GetAngle);

  enum_<b2BodyType>("b2BodyType")
      .value("b2_staticBody", b2_staticBody)
      .value("b2_kinematicBody", b2_kinematicBody)
      .value("b2_dynamicBody", b2_dynamicBody);


}

#endif
