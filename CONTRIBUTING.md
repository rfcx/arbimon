# Biodiversity Project - Developer Style Guide

_This is a living document. If you want to propose a new standard/convention, feel free to PR!_

## Vue

### **1.1 Vue 3 Style Guide [Manual]**

Follow the [Vue 3 Style Guide](https://v3.vuejs.org/style-guide)

## Vue-Class-Component

### **2.1 Accessibility Modifiers [Automatic]**

Vanilla Vue components have no concept of public/protected/private, so these modifiers are meaningless. To avoid confusion and promote consistency, they should not be used.

Incorrect:

```ts
public myField = 123
private updateMyField () { ... }
```

Correct:

```ts
myField = 123
updateMyField () { ... }
```

## Vue-Property-Decorator

### **3.1 Naming Conventions [Manual]**

Due to [a limitation of `eslint-plugin-sort-class-members`](https://github.com/bryanrsmith/eslint-plugin-sort-class-members/issues/69#issue-988653622), the following conventions are needed:

- All `@Emit` methods must be prefixed, ex: `emitSomething()`
- All `@Watch` methods must be prefixed, ex: `onSomething()`

### **3.2 Class Member Order [Automatic]**

The following ordering is an interpretation of the [component/instance order](https://v3.vuejs.org/style-guide/#component-instance-options-order-recommended) from the Vue 3 Style Guide, as applied to vue-class-component classes:

```ts
@Options({
  // 3. Template deps
  components: { MyChildComponent }
  directives: { ... }
})
// 1 & 4. Name, extends, mixins
export default class ExampleComponent extends Vue {
  // 4. Composition
  @Inject({ from: authClientKey }) readonly auth!: AuthClient
  @Provide() title = 'Awesome Page!'

  // 5. Interface
  @Prop(Number) readonly count: number | undefined
  @Emit() emitAddToCount(n: number) { this.count += n }

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

  @Watch('count') onCountChange() { ... }

  // 9. Non-Reactive (methods)
  resetCount ():void {
    this.count = 0
  }
}
</script>
```
