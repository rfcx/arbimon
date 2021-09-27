## Biodiversity Project - Developer Style Guide

*This is a living document. If you want to propose a new standard/convention, feel free to create PR!*

### Overview

1. Follow [Vue 3 Style Guide](https://v3.vuejs.org/style-guide)
 
### Member-Order Example

Example class-component, based on [component/instance order](https://v3.vuejs.org/style-guide/#component-instance-options-order-recommended) from the Vue 3 Style Guide:

```ts
@Options({
  // 3. Template deps
  components: { MyChildComponent }
  directives: { ... }
})
// 1 & 4. Name, extends, mixins
export default class ExampleComponent extends Vue { 
  // 4. Composition
  @Inject() readonly auth!: AuthApi
  @Provide() title = 'Awesome Page!'

  // 5. Interface
  @Prop(Number) readonly count: number | undefined
  @Emit() addToCount(n: number) { this.count += n }

  // 6 & 7. Local reactive state
  oldTodos = setup(() => TodoService.get())
  newTodos: Todo[] = []
  
  get allTodos (): Todo[] {
    return [...this.oldTodos, ...this.newTodos]
  }

  // 8. Events (lifecycle)
  async mounted (): Promise<void> {
    // ...
  }

  // 9. Non-Reactive (methods)
  resetCount ():void {
    this.count = 0
  }
}
</script>
```
