cmake_minimum_required(VERSION 3.9)
cmake_policy(SET CMP0042 NEW)
set(CMAKE_CXX_STANDARD 17)

project(ccLib)

set(CMAKE_MODULE_PATH ${PROJECT_SOURCE_DIR}/build_support/cmake)

if(NOT CMAKE_BUILD_TYPE AND NOT CMAKE_CONFIGURATION_TYPES)
        message(STATUS "Setting build type to `Debug` as none was specified.")
        set(CMAKE_BUILD_TYPE "Debug")
endif()

find_package(ALSA REQUIRED)
if (NOT ALSA_FOUND)
        message(FATAL_ERROR "ALSA not found")
endif()
message(STATUS "ALSA_LIBRARIES: ${ALSA_LIBRARIES}")
#
# !! ATTENTION
# clear cache (CMakeCache.txt) if you change this
#
find_package(FFmpeg COMPONENTS AVCODEC AVFORMAT AVUTIL REQUIRED)
#
# END ATTENTION
#
set(THREADS_PREFER_PTHREAD_FLAG ON)
find_package(Threads REQUIRED)
set(CMAKE_CXX_FLAGS_DEBUG "${CMAKE_CXX_FLAGS_DEBUG} -Wall -Wextra -Werror")
set(CMAKE_CXX_FLAGS_DEBUG "${CMAKE_CXX_FLAGS_DEBUG} -Wno-unused-parameter -Wno-attributes")

include_directories(${CMAKE_JS_INC})
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/ccSrc/lib/include)
file(GLOB SOURCE_FILES "ccSrc/lib/src/*.cc" "ccSrc/jsInterface/*.cc")
add_library(${PROJECT_NAME} SHARED ${SOURCE_FILES} ${CMAKE_JS_SRC})
set_target_properties(${PROJECT_NAME} PROPERTIES PREFIX "" SUFFIX ".node")
target_link_libraries(${PROJECT_NAME} ${CMAKE_JS_LIB})

execute_process(
    COMMAND node -p "require('node-addon-api').include"
    WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
    OUTPUT_VARIABLE NODE_ADDON_API_DIR
)

string(REGEX REPLACE "[\r\n\"]" "" NODE_ADDON_API_DIR ${NODE_ADDON_API_DIR})

target_include_directories(${PROJECT_NAME} PRIVATE ${NODE_ADDON_API_DIR})

target_link_libraries(${PROJECT_NAME} PRIVATE ${AVUTIL_LIBRARIES})
target_link_libraries(${PROJECT_NAME} PRIVATE ${AVCODEC_LIBRARIES})
target_link_libraries(${PROJECT_NAME} PRIVATE ${AVFORMAT_LIBRARIES})

target_link_libraries(
  ${PROJECT_NAME}
  PRIVATE
  ${ALSA_LIBRARIES}
)

target_link_libraries(
  ${PROJECT_NAME}
  PRIVATE
  Threads::Threads
)

add_definitions(-DNAPI_VERSION=8)