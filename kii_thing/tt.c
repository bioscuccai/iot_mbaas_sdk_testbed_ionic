#include "example.h"

#include <kii_thing_if.h>
#include <kii_json.h>

#include <string.h>
#include <stdio.h>
#include <getopt.h>
#include <stdlib.h>
#include <time.h>

#define EX_COMMAND_HANDLER_BUFF_SIZE 50000
#define EX_STATE_UPDATER_BUFF_SIZE 50000
#define EX_MQTT_BUFF_SIZE 50000
#define EX_STATE_UPDATE_PERIOD 3

static kii_bool_t action_handler(
        const char* schema,
        int schema_version,
        const char* action_name,
        const char* action_params,
        char error[EMESSAGE_SIZE + 1]){
  printf("#############################");
  printf("action: %s\n", action_name);
  printf("action params: %s\n", action_params);
  return KII_TRUE;
}



static kii_bool_t state_handler(
        kii_t* kii,
        KII_THING_IF_WRITER writer){
  fflush(stdout);
  //int randTemp=-10+rand()%50;
  int randTemp=3;
  char jsonString[512];
  printf("temp: %d\n", randTemp);
  sprintf(&jsonString, "{\"temp\": %d, \"lon\": 30, \"lat\": 50}", randTemp);
  //(*writer)(kii, "{\"temp\": 30, \"lon\": 30, \"lat\": 50}");
  if(((*writer)(kii, &jsonString))==KII_FALSE){
    printf("@@@@@@Write error\n");
    return KII_FALSE;
  }
  return KII_TRUE;
}

int main(int argc, char *argv[]){
  srand(time(NULL));
  
  kii_bool_t result;
  kii_thing_if_command_handler_resource_t command_handler_resource;
  kii_thing_if_state_updater_resource_t state_updater_resource;
  char command_handler_buff[EX_COMMAND_HANDLER_BUFF_SIZE];
  char state_updater_buff[EX_STATE_UPDATER_BUFF_SIZE];
  char mqtt_buff[EX_MQTT_BUFF_SIZE];
  kii_thing_if_t kii_thing_if;

  // prepare for the command handler
  command_handler_resource.buffer = command_handler_buff;
  command_handler_resource.buffer_size =
      sizeof(command_handler_buff) / sizeof(command_handler_buff[0]);
  command_handler_resource.mqtt_buffer = mqtt_buff;
  command_handler_resource.mqtt_buffer_size =
      sizeof(mqtt_buff) / sizeof(mqtt_buff[0]);
  command_handler_resource.action_handler = action_handler;

  // prepare for the state updater
  state_updater_resource.buffer = state_updater_buff;
  state_updater_resource.buffer_size =
      sizeof(state_updater_buff) / sizeof(state_updater_buff[0]);
  state_updater_resource.period = EX_STATE_UPDATE_PERIOD;
  state_updater_resource.state_handler = state_handler;

  // initialize
  result = init_kii_thing_if_with_onboarded_thing(&kii_thing_if, getenv("THING_APP_ID"), getenv("THING_APP_TOKEN"),
	      "US", getenv("THING_ID"), getenv("THING_AUTH"),
	      &command_handler_resource, &state_updater_resource, NULL);
  if (result == KII_FALSE) {
    // Failed to initialize the SDK
    printf("error");
  } else {
   printf("ok\n"); 
  }
  
  while(1){};
  return 0;
}