class CreateRegistrations < ActiveRecord::Migration
  def change
    create_table :registrations do |t|
      t.string :name
      t.string :lastname
      t.string :email
      t.integer :age
      t.string :gender
      t.string :password

      t.timestamps null: false
    end
  end
end
