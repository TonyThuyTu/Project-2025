module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id_order: 
        { type: DataTypes.INTEGER, 
            autoIncrement: true, 
            primaryKey: true 
        },
    id_customer: 
        { type: DataTypes.INTEGER, 
            allowNull: false 
        },
    total_amount: 
        { type: DataTypes.DECIMAL(10, 2), 
            allowNull: false 
        },
    shipping_fee: 
        { type: DataTypes.DECIMAL(10, 2), 
            allowNull: false 
        },
    payment_method: 
        { 
            type: DataTypes.TINYINT, 
            // defaultValue: 0,
            allowNull: false 
        },
    payment_status: 
        { 
            type: DataTypes.TINYINT,
            defaultValue: 0,
            allowNull: false 
        },
    order_status: 
        {
            type: DataTypes.TINYINT,
            defaultValue: 0,
            allowNull: false 
        },
    order_date: 
        { 
            type: DataTypes.DATE, 
            defaultValue: DataTypes.NOW 
        }
  }, {
    tableName: 'orders',
    timestamps: false
  });

  return Order;
};
