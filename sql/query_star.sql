SELECT vc.CUSTOMER_ID, vc.CUSTOMER_NAME, vc.CUST_STATUS  
	FROM sigitm_star_imp.val_customer vc
   	WHERE vc.CUSTOMER_ID = {{id_comercial}}
    
  
