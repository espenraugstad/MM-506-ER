export async function getPresentation(presentationId) {
    let serverData = await fetch(`/getPresentation/${presentationId}`, {
      method: "get",
      headers: {
        "content-type": "application/json",
        authorization: "Bearer " + localStorage.getItem("sillytoken"),
      },
    });
  
    if(serverData.status === 200){
      let results = await serverData.json();
      return results;
    } else {
      console.log(serverData.status);
    }
  
  }