import 'reflect-metadata';
import { Model, ToMany, Field } from "../..";
import { ResourceHook } from "../../lib/resource.hooks";


@Model()
export class Course extends ResourceHook {
  @Field({optional:true})
  name: string
}
