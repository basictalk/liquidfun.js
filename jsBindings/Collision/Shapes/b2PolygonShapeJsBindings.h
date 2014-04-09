#ifndef B2POLYGONSHAPEJSBINDINGS_H
#define B2POLYGONSHAPEJSBINDINGS_H
#include <emscripten/bind.h>
#include <Box2D/Box2D.h>

using namespace emscripten;
EMSCRIPTEN_BINDINGS(b2PolygonShape) {
  class_<b2PolygonShape, base<b2Shape>>("b2PolygonShape")
      .constructor<>()
      .function("SetAsBox_xy",
                select_overload<void(float32, float32)>(&b2PolygonShape::SetAsBox))
      .function("SetAsBox_xy_center_angle",
                select_overload<void(float32, float32, const b2Vec2&, float32)>(&b2PolygonShape::SetAsBox),
                allow_raw_pointer<arg<2>>())
      .property("m_centroid", &b2PolygonShape::m_centroid);
}

#endif
