import { ResourceDispatcher } from "../../lib/resource.dispatcher";
import { Model, ToMany, Field } from "../..";
import 'reflect-metadata';


@Model()
export class Course extends ResourceDispatcher {
  @Field({optional:true})
  name: string
}
