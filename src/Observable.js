export const Observable = (val, resMsg, errMsg) => ({
  type: "observable",
  val,
  isEqual: observable =>
    observable.type === "observable" && observable.val === val,
  update: () => {},
  replace: (context, oldObservable, index) => {
    context
      .replace(
        index,
        val.subscribe(
          res => context.fork(resMsg(res)),
          err => context.fork(errMsg(err)),
        ),
      )
      .unsubscribe();
  },
  append: context => {
    context.append(
      val.subscribe(
        res => context.fork(resMsg(res)),
        err => context.fork(errMsg(err)),
      ),
    );
  },
  destroy: (context, index) => {
    context.destroy(index).unsubscribe();
  },
});
