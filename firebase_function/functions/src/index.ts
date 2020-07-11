import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
admin.initializeApp()

export const onSupplierCreate = functions.database
.ref('Supplier/List/{phone}')
.onCreate(async (snapshot, context) => {
    const countRef = snapshot.ref.parent?.parent?.child("number")
    await countRef?.transaction(number => {
        return number + 1
    })
    return countRef?.once("value")
    .then(function(dataSnapshot){
        const number = dataSnapshot.val()
        return snapshot.ref.update({supplierID: String(number)})
    });
})
export const onSupplierDelete = functions.database
.ref('Supplier/List/{phone}')
.onDelete((snapshot, context) => {
    const countRef = snapshot.ref.parent?.parent?.child("number")
    return countRef?.transaction(number => {
        return number - 1
    })
})

export const onUserCreate = functions.database
.ref('User/List/{userName}')
.onCreate((snapshot, context) => {
    const countRef = snapshot.ref.parent?.parent?.child("number")
    return countRef?.transaction(number => {
        return number + 1
    })
    
})
export const onUserDelete = functions.database
.ref('User/List/{userName}')
.onDelete((snapshot, context) => {
    const countRef = snapshot.ref.parent?.parent?.child("number")
    return countRef?.transaction(number => {
        return number - 1
    })
})

export const onFoodCreate = functions.database
.ref('Food/List/{food}')
.onCreate(async (snapshot, context) => {
    const countRef = snapshot.ref.parent?.parent?.child("number")
    await countRef?.transaction(number => {
        return number + 1
    })
    return countRef?.once("value")
    .then(function(dataSnapshot){
        const number = dataSnapshot.val()
        return snapshot.ref.update({foodID: String(number), star: "0", status:"0"})
    });
})
export const onFoodDelete = functions.database
.ref('Food/List/{food}')
.onDelete((snapshot, context) => {
    const countRef = snapshot.ref.parent?.parent?.child("number")
    return countRef?.transaction(number =>{
        return number - 1
    })
})

export const onOrderCreate = functions.database
.ref('Order/CurrentOrder/List/{order}')
.onCreate((snapshot, context) => {
    const countRef = snapshot.ref.parent?.parent?.child("number")
    return countRef?.transaction(number => {
        return number + 1
    })
})
export const onOrderUpdate = functions.database
.ref('Order/CurrentOrder/List/{order}')
.onUpdate(async (change, context) =>{
    const order = context.params.order
    const after = change.after
    const deliveredOrderRef = after.ref.root.child("Order/DeliveredOrder/List")
    const val = after.val()
    if(val.status == "2"){
        await deliveredOrderRef.child(order).set(val)
        return after.ref.remove()
    }
    else return null
})
export const onOrderDelete = functions.database
.ref('Order/CurrentOrder/List/{order}') 
.onDelete(async (snapshot, context) => {
    const countRef = snapshot.ref.parent?.parent?.child("number")
    if(snapshot.val().status != "2"){
        const order = context.params.order
        const canceledOrder = snapshot.ref.root.child("Order/CanceledOrder/List")
        await canceledOrder.child(order).set(snapshot.val())
    }
    return countRef?.transaction(number =>{
        return number - 1
    })
})

export const onCanceledOrderCreate = functions.database
.ref('Order/CanceledOrder/List/{order}')
.onCreate((snapshot, context) => {
    const countRef = snapshot.ref.parent?.parent?.child("number")
    return countRef?.transaction(number => {
        return number + 1
    })
})
export const onDeliveredOrderCreate = functions.database
.ref('Order/DeliveredOrder/List/{order}') 
.onCreate((snapshot, context) => {
    const countRef = snapshot.ref.parent?.parent?.child("number")
    return countRef?.transaction(number =>{
        return number + 1
    })
})

export const onRatingCreate = functions.database
.ref('Rating/{food}/List/{userName}')
.onCreate(async (snapshot, context) => {
    const countRef = snapshot.ref.parent?.parent?.child("number")
    const food = context.params.food
    const rateValue = snapshot.val().rateValue

    await  countRef?.transaction( number =>{
        return number + 1
    })
    return countRef?.once("value")
    .then(function(dataSnapshot){
        const number = dataSnapshot.val()
        const starRef = countRef.root.child("Food/List").child(food).child("star")
        return starRef.transaction(star =>{
            
            return String((parseFloat(rateValue) + (number - 1)*parseFloat(star)) / number)
        })
    })
})
export const onRatingUpdate = functions.database 
.ref('Rating/{food}/List/{userName}')
.onUpdate((change, context) => {
    const after = change.after
    const before = change.before
    const beforeValue = before.val().rateValue
    const afterValue = after.val().rateValue
    const countRef = after.ref.parent?.parent?.child("number")
    const food = context.params.food
    
    return countRef?.once("value")
    .then(function(dataSnapshot){
        const number = dataSnapshot.val()
        const starRef = countRef.root.child("Food/List").child(food).child("star")
        return starRef.transaction(star =>{
            return String((parseFloat(afterValue) - parseFloat(beforeValue) + number*parseFloat(star)) / number)
        })
    })
})
/*function setID(supplierID: string): string {
    return  supplierID;
}*/
/*export const onMessageUpdate = functions.database
.ref('Supplier/{phone}')
.onUpdate((change, context) => {
    const before = change.before.val();
    const after = change.after.val();
)}*/
