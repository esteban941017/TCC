export default class Registry {
  dependencies: { [name: string]: any };
  private static instance: Registry;

  private constructor() {
    this.dependencies = {};
  }

  provide(name: string, dependency: any) {
    if (this.dependencies[name]) return;
    this.dependencies[name] = dependency;
  }

  inject(name: string) {
    return this.dependencies[name];
  }

  static getInstance() {
    if (!Registry.instance) {
      Registry.instance = new Registry();
    }
    return Registry.instance;
  }
}
