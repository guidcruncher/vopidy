export class Pager {
  public limit: number = 0
  public offset: number = 0
  public total: number = 0
  public page: number
  public pageTotal: number
}

export class PagedItems<T = any> extends Pager {
  public items: T[] = []
}
