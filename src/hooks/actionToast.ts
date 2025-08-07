import { toast } from "sonner";

export function actionToast(actionData: { error: boolean; message: string }) {
  const { error, message } = actionData;
  const themedToast = error ? toast.error : toast.success;
  const title = error ? "Error" : "Success";
  // TODO: theme properly
  return themedToast(title, {
    description: message,
    // className: error ? "destructive" : "default",
  });
  // return toast({
  //   ...props,
  //   title: actionData.error ? "Error" : "Success",
  //   description: actionData.message,
  //   variant: actionData.error ? "destructive" : "default",
  // })
}
