export class Pager {
  public limit: number = 0
  public offset: number = 0
  public total: number = 0
  public query: string = ""
  public page: number = 0
  public pageTotal: number = 0

  public calculatePaging() {
    this.page = this.total > 0 ? Math.ceil(this.offset / this.limit) + 1 : 0
    this.pageTotal = this.total > 0 ? Math.ceil(this.total / this.limit) : 0
  }
}

export class PagedItems<T = any> extends Pager {
  public items: T[] = []
}

export const shimNonPaged = (res) => {
  let content = new PagedItems()
  content.offset = 0

  if (res.items) {
    content.items = JSON.parse(JSON.stringify(res.items))
  }

  content.limit = content.items.length
  content.total = content.items.length
  content.calculatePaging()
  res.content = content
  res.items = undefined
  return res
}
